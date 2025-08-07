import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ScriptManagerUI from '../application/UI/script_manager';

export default function Home() {
  const router = useRouter();
  const { tab } = router.query;

  // If user is trying to access scripts, redirect to the new scripts page
  useEffect(() => {
    // if (tab === 'sofi') {
    //   router.replace('/sofi');
    // }
  }, [tab, router]);

  return <ScriptManagerUI initialTab={tab as string} />;
}