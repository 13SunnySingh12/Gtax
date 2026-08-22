package com.gtax.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.gtax.config.GtaxProperties;
import com.gtax.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

/**
 * Uploads receipt files to a private Supabase Storage bucket and returns a
 * signed URL that both the frontend (to display the image) and FastAPI (to run
 * OCR) can read. Files are namespaced by user id ({@code {userId}/{uuid}.ext})
 * so the storage RLS policy keeps them private per user.
 */
@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);
    /** Signed URL lifetime: long enough to persist as file_url for MVP. */
    private static final int SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

    private final RestClient supabase;
    private final String bucket;
    private final String supabaseUrl;

    public SupabaseStorageService(RestClient supabaseRestClient, GtaxProperties props) {
        this.supabase = supabaseRestClient;
        this.bucket = props.supabase().storageBucket();
        this.supabaseUrl = props.supabase().url() == null ? "" : props.supabase().url();
    }

    /**
     * Uploads the bytes and returns a signed, readable URL.
     *
     * @return the fully-qualified signed URL to store as {@code receipts.file_url}
     */
    public String uploadReceipt(UUID userId, String originalFilename, byte[] bytes, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new BadRequestException("Receipt file is empty");
        }
        String ext = extension(originalFilename);
        String objectPath = userId + "/" + UUID.randomUUID() + ext;
        MediaType mediaType = contentType != null
                ? MediaType.parseMediaType(contentType)
                : MediaType.APPLICATION_OCTET_STREAM;

        try {
            // Build the URI explicitly so the '/' in {userId}/{file} stays a real
            // path separator. A {path} template variable would be encoded to %2F,
            // which Supabase's sign/download endpoints reject (400).
            URI uploadUri = URI.create(
                    supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath);
            supabase.post()
                    .uri(uploadUri)
                    .header("x-upsert", "true")
                    .contentType(mediaType)
                    .body(bytes)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error("Receipt upload to Supabase Storage failed: {}", e.getMessage());
            throw new BadRequestException("Could not upload the receipt file. Please try again.");
        }

        return createSignedUrl(objectPath);
    }

    private String createSignedUrl(String objectPath) {
        try {
            URI signUri = URI.create(
                    supabaseUrl + "/storage/v1/object/sign/" + bucket + "/" + objectPath);
            JsonNode body = supabase.post()
                    .uri(signUri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("expiresIn", SIGNED_URL_TTL_SECONDS))
                    .retrieve()
                    .body(JsonNode.class);
            if (body != null && body.hasNonNull("signedURL")) {
                // signedURL is a relative path like /object/sign/bucket/path?token=...
                return supabaseBase() + "/storage/v1" + body.get("signedURL").asText();
            }
        } catch (RestClientException e) {
            log.warn("Signed URL creation failed, falling back to object path: {}", e.getMessage());
        }
        // Fallback: store the object path; a signing endpoint can resolve it later.
        return supabaseBase() + "/storage/v1/object/" + bucket + "/" + objectPath;
    }


    /**
     * Best-effort deletion of a stored receipt file, given the URL we saved in
     * {@code receipts.file_url}. Storage cleanup must never block the delete of
     * the user's expense, so failures are logged and swallowed.
     */
    public void deleteReceipt(String fileUrl) {
        String objectPath = objectPathFrom(fileUrl);
        if (objectPath == null) {
            log.warn("Could not derive a storage path from the receipt URL; skipping file delete");
            return;
        }
        try {
            supabase.delete()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Receipt file delete failed for {}: {}", objectPath, e.getMessage());
        }
    }

    /** Extract "{userId}/{uuid}.ext" from either a signed or a plain object URL. */
    String objectPathFrom(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        String url = fileUrl;
        int q = url.indexOf('?');
        if (q >= 0) url = url.substring(0, q);          // drop the ?token=...
        String signed = "/object/sign/" + bucket + "/";
        String plain = "/object/" + bucket + "/";
        int i = url.indexOf(signed);
        if (i >= 0) return url.substring(i + signed.length());
        i = url.indexOf(plain);
        if (i >= 0) return url.substring(i + plain.length());
        return null;
    }

    private String supabaseBase() {
        return supabaseUrl;
    }

    private String extension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase() : "";
    }
}
