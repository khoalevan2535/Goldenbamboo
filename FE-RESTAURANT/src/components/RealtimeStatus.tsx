import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { FaWifi, FaWifiSlash, FaSync, FaExclamationTriangle } from 'react-icons/fa';

interface RealtimeStats {
  orders: {
    connectedSessions: number;
    endpoint: string;
    description: string;
  };
  kitchen: {
    connectedSessions: number;
    endpoint: string;
    description: string;
  };
  tables: {
    connectedSessions: number;
    endpoint: string;
    description: string;
  };
  totalConnections: number;
}

interface RealtimeStatusProps {
  className?: string;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ className }) => {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/realtime/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch realtime stats');
      }

      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getConnectionStatus = (count: number) => {
    if (count > 0) return 'success';
    if (count === 0) return 'warning';
    return 'danger';
  };

  const getStatusIcon = (count: number) => {
    if (count > 0) return <FaWifi className="text-success" />;
    return <FaWifiSlash className="text-muted" />;
  };

  if (loading && !stats) {
    return (
      <Card className={className}>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Loading realtime status...</span>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          🔄 Realtime System Status
        </h6>
        <div>
          <Button 
            size="sm" 
            variant="outline-primary" 
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : <FaSync />}
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {stats && (
          <div>
            <div className="row mb-3">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Total Connections:</span>
                  <Badge bg={getConnectionStatus(stats.totalConnections)}>
                    {stats.totalConnections}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-2">
                <div className="border rounded p-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold">Orders</span>
                    {getStatusIcon(stats.orders.connectedSessions)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Sessions</span>
                    <Badge bg={getConnectionStatus(stats.orders.connectedSessions)}>
                      {stats.orders.connectedSessions}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-2">
                <div className="border rounded p-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold">Kitchen</span>
                    {getStatusIcon(stats.kitchen.connectedSessions)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Sessions</span>
                    <Badge bg={getConnectionStatus(stats.kitchen.connectedSessions)}>
                      {stats.kitchen.connectedSessions}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-2">
                <div className="border rounded p-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold">Tables</span>
                    {getStatusIcon(stats.tables.connectedSessions)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Sessions</span>
                    <Badge bg={getConnectionStatus(stats.tables.connectedSessions)}>
                      {stats.tables.connectedSessions}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {lastUpdate && (
              <div className="mt-2 text-center">
                <small className="text-muted">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </small>
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
