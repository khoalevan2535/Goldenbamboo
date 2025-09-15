
import { Outlet } from 'react-router-dom';
import ClientHeader from '../components/user/Header';
import ClientFooter from '../components/user/Footer';
import '../style/client/HomeClient.scss';
export default function ClientLayout() {
  return (
    <div className="">
      <div className="sticky-top shadow-sm">
        <ClientHeader />
      </div>
      <main className="background-color">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}