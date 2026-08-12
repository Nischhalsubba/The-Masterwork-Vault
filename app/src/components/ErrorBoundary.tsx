import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props { children: ReactNode; name?: string }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State { return { error } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Masterwork Vault] ${this.props.name || 'UI'} failed`, error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="mw-error-boundary" role="alert">
        <AlertTriangle size={28} aria-hidden="true" />
        <div>
          <small>{this.props.name || 'This section'} could not render</small>
          <h2>The rest of the Vault is still safe.</h2>
          <p>{this.state.error.message || 'An unexpected rendering error occurred.'}</p>
          <button type="button" onClick={() => this.setState({ error: null })}><RotateCcw size={16} aria-hidden="true" />Try this section again</button>
        </div>
      </section>
    )
  }
}
