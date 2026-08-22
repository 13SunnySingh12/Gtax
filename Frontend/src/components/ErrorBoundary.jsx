import { Component } from 'react';
import ServerError from '@/pages/errors/ServerError';

/**
 * Catches uncaught render/runtime errors anywhere in the tree and shows the 500
 * screen instead of a white page (graceful failure, never crash the app).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ServerError onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
