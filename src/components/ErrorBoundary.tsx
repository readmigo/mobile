import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportError, addBreadcrumb } from '@/services/crashTracking';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    addBreadcrumb('error', 'ErrorBoundary caught error', 'error', {
      componentStack: errorInfo.componentStack ?? 'unknown',
    });
    reportError(error, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={this.handleRetry}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FAFAFA',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
