import React, { useState, useEffect } from 'react';
import { cartStorageManager, StorageType } from '../../utils/cartStorageManager';

interface StorageSettingsPanelProps {
  show?: boolean;
  onClose?: () => void;
}

export const StorageSettingsPanel: React.FC<StorageSettingsPanelProps> = ({ 
  show = false, 
  onClose 
}) => {
  const [storageType, setStorageType] = useState<StorageType>('hybrid');
  const [autoSave, setAutoSave] = useState(true);
  const [saveInterval, setSaveInterval] = useState(1000);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    if (show) {
      const info = cartStorageManager.getStorageInfo();
      setStorageInfo(info);
      setStorageType(info.config.primaryStorage);
      setAutoSave(info.config.autoSave);
      setSaveInterval(info.config.saveInterval);
    }
  }, [show]);

  const handleSaveSettings = () => {
    cartStorageManager.updateConfig({
      primaryStorage: storageType,
      autoSave: autoSave,
      saveInterval: saveInterval
    });
    
    setStorageInfo(cartStorageManager.getStorageInfo());
    console.log('⚙️ Storage settings updated');
  };

  const handleTestStorage = (type: StorageType) => {
    const testData = {
      items: [{
        uid: 'test-1-1',
        item_type: 'dish',
        item_id: 1,
        branch_id: 1,
        branch_name: 'Test Branch',
        name: 'Test Item',
        image_url: '',
        unit_price: 10000,
        final_price: 10000,
        qty: 1,
        checked: true
      }],
      selectedBranchId: 1
    };

    const success = cartStorageManager.saveCartData(testData);
    const loaded = cartStorageManager.loadCartData();
    
    console.log(`🧪 Test ${type}:`, { success, loaded: !!loaded });
    
    // Clean up test data
    cartStorageManager.clearCartData();
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 10000,
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#007bff' }}>⚙️ Storage Settings</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#dc3545'
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>📊 Current Storage Info:</h4>
        <pre style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(storageInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>🔧 Storage Configuration:</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Primary Storage Type:
          </label>
          <select
            value={storageType}
            onChange={(e) => setStorageType(e.target.value as StorageType)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="localStorage">localStorage (Persistent)</option>
            <option value="sessionStorage">sessionStorage (Tab Session)</option>
            <option value="memory">Memory (Temporary)</option>
            <option value="hybrid">Hybrid (localStorage + sessionStorage)</option>
          </select>
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
            {storageType === 'localStorage' && '💾 Persists across browser sessions'}
            {storageType === 'sessionStorage' && '🔄 Persists only in current tab session'}
            {storageType === 'memory' && '⚡ Only in memory, lost on page reload'}
            {storageType === 'hybrid' && '🔄💾 Uses both localStorage and sessionStorage for maximum reliability'}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            <span style={{ fontWeight: 'bold' }}>Auto Save</span>
          </label>
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
            Automatically save cart data every {saveInterval}ms
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Save Interval (ms):
          </label>
          <input
            type="number"
            value={saveInterval}
            onChange={(e) => setSaveInterval(Number(e.target.value))}
            min="100"
            max="10000"
            step="100"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>🧪 Test Storage:</h4>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(['localStorage', 'sessionStorage', 'memory', 'hybrid'] as StorageType[]).map(type => (
            <button
              key={type}
              onClick={() => handleTestStorage(type)}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Test {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveSettings}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          💾 Save Settings
        </button>
        
        <button
          onClick={() => {
            cartStorageManager.clearCartData();
            setStorageInfo(cartStorageManager.getStorageInfo());
          }}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧹 Clear Cart
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li><strong>localStorage:</strong> Best for permanent storage, survives browser restart</li>
          <li><strong>sessionStorage:</strong> Good for temporary storage, survives F5 but not tab close</li>
          <li><strong>memory:</strong> Fastest but lost on page reload</li>
          <li><strong>hybrid:</strong> Most reliable, uses both storage types</li>
        </ul>
      </div>
    </div>
  );
};






