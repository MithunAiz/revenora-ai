export function simulateClearinghouseValidation(claim) {
  const isDuplicate = claim.claimId.endsWith('999');
  const missingNpi = !claim.primaryPhysician || claim.primaryPhysician.length < 3;

  const checks = [
    { name: 'ANSI X12 837 EDI Format Syntax', passed: true, detail: 'Valid 837P format' },
    { name: 'NPI Provider Directory Lookup', passed: !missingNpi, detail: missingNpi ? 'Provider NPI unverified' : 'Valid NPI' },
    { name: 'Clearinghouse Duplicate Claim Check', passed: !isDuplicate, detail: isDuplicate ? 'Duplicate transaction ID' : 'No duplicate' },
    { name: 'Subscriber Eligibility Routing Header', passed: true, detail: 'Payer ID 60054 routed successfully' },
  ];

  const failedCheck = checks.find((c) => !c.passed);
  const status = failedCheck ? 'Returned' : 'Accepted';
  const reason = failedCheck ? failedCheck.detail : 'Clearinghouse batch validation passed successfully.';

  return {
    status,
    batchId: `BATCH-837-${Math.floor(100000 + Math.random() * 900000)}`,
    reason,
    checks,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
