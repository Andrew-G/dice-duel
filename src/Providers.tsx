'use client';

import React, { useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

type ProvidersProps = {
    children: React.ReactNode;
};

function Providers({ children }: ProvidersProps) {
    const [client] = useState(new QueryClient());


    return (
            <QueryClientProvider client={client}>
                            {children}
            </QueryClientProvider>
    );
}

export default Providers;
