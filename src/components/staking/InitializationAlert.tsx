"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';
import type { InitializationStatus } from '@/hooks/useStaking';

interface InitializationAlertProps {
    initializationStatus: InitializationStatus;
    onInitialize?: () => void;
    isInitializing?: boolean;
}

export function InitializationAlert({
    initializationStatus,
    onInitialize,
    isInitializing = false
}: InitializationAlertProps) {
    const { isInitialized, missingComponents, canAutoInitialize } = initializationStatus;

    if (isInitialized) {
        return (
            <Card className="bg-green-900/20 border border-green-700/40 mb-6">
                <CardContent className="flex items-center gap-3 pt-6">
                    <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />
                    <span className="text-green-300">Stake pool is properly initialized and ready to use.</span>
                </CardContent>
            </Card>
        );
    }

    const openAdminPanel = () => {
        window.open('/admin', '_blank');
    };

    return (
        <Card className="bg-yellow-900/20 border border-yellow-700/40 mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-5 h-5" />
                    Stake Pool Not Initialized
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-yellow-200">
                    The staking pool requires initialization before it can be used.
                    The following components are missing:
                </p>

                <ul className="list-disc list-inside text-yellow-300 space-y-1">
                    {missingComponents.map((component, index) => (
                        <li key={index}>{component}</li>
                    ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        onClick={openAdminPanel}
                        variant="outline"
                        className="border-yellow-600 text-yellow-300 hover:bg-yellow-900/30 hover:border-yellow-500"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Admin Panel
                    </Button>

                    {canAutoInitialize && onInitialize && (
                        <Button
                            onClick={onInitialize}
                            disabled={isInitializing}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            {isInitializing ? 'Initializing...' : 'Auto-Initialize'}
                        </Button>
                    )}
                </div>

                {!canAutoInitialize && (
                    <p className="text-sm text-yellow-400 mt-2">
                        Note: You need admin privileges to initialize the stake pool components.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
