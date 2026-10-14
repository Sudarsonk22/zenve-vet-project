import { BrowserRouter } from 'react-router-dom';
import NetworkApp from './network-ui/NetworkApp';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <NetworkApp />
    </BrowserRouter>
  );
}
