import { Component } from 'react';
import { Button } from '@heroui/react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-danger">Something went wrong</h1>
            <p className="text-default-500">{this.state.error?.message}</p>
            <Button onPress={() => window.location.reload()} color="primary">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}