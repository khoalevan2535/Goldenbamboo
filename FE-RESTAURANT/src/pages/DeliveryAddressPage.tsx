import React from 'react';
import { Container } from 'react-bootstrap';
import DeliveryAddressManager from '../components/delivery/DeliveryAddressManager';
import styles from '../style/AccountPage.module.scss';

const DeliveryAddressPage: React.FC = () => {
  return (
    <div className={styles['account-page-wrapper']}>
      <Container fluid>
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 className={`display-5 fw-bold ${styles['text-gradient']} mb-3`}>
                <i className="fas fa-map-marker-alt me-3"></i>
                Địa chỉ giao hàng
              </h1>
              <p className="text-muted fs-5">
                Quản lý các địa chỉ giao hàng của bạn
              </p>
            </div>

            <DeliveryAddressManager />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DeliveryAddressPage;
