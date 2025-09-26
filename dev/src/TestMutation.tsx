import React from 'react';
import { useVerifyCredentials } from '@passportxyz/passport-embed';

export const TestMutation = () => {
  const mutation = useVerifyCredentials({
    apiKey: 'test',
    address: '0x123',
    scorerId: 'test',
    embedServiceUrl: 'http://localhost:8004'
  });

  React.useEffect(() => {
    // Log the mutation object to see what properties it has
    console.log('Mutation object:', mutation);
    console.log('Has data property?', 'data' in mutation);
    console.log('Has mutateAsync?', 'mutateAsync' in mutation);
    console.log('Current data value:', mutation.data);
  }, [mutation]);

  const handleClick = async () => {
    console.log('Before mutation - data:', mutation.data);

    // Try using mutateAsync
    try {
      const result = await mutation.mutateAsync(['test-stamp']);
      console.log('mutateAsync result:', result);
      console.log('Has credentialErrors?', 'credentialErrors' in result);
    } catch (err) {
      console.error('Mutation error:', err);
    }

    // Check data property after mutation
    setTimeout(() => {
      console.log('After mutation - data:', mutation.data);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', marginTop: '20px' }}>
      <h3>Mutation Test</h3>
      <button onClick={handleClick}>Test Mutation</button>
      <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
      <div>Status: {mutation.status}</div>
      <div>isPending: {String(mutation.isPending)}</div>
      <div>isSuccess: {String(mutation.isSuccess)}</div>
    </div>
  );
};