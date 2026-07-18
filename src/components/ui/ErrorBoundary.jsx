import { Component } from 'react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  state = { heeftFout: false };

  static getDerivedStateFromError() {
    return { heeftFout: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.heeftFout) {
      return (
        <div className="eb-val">
          <div className="eb-titel">Er ging iets mis</div>
          <p className="eb-tekst">
            Dit scherm kon niet geladen worden. Je andere gegevens zijn veilig.
          </p>
          <button className="btn btn-p" onClick={() => window.location.reload()}>
            Pagina herladen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
