import { useState, useCallback, useEffect } from 'react';
import { Stepper, Group, Button } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { KeyManager } from './KeyManager';
import { SigningStep } from './SigningStep';
import { EncryptionStep } from './EncryptionStep';
import { ExchangeResult } from './ExchangeResult';
import {
  saveKeyPair,
  loadKeyPair,
  saveIssuer,
  loadIssuer,
  type StoredKeyPair,
} from '@/lib/exchange/keys';
import type { ExchangeResponse } from '@/lib/exchange/client';

export function ExchangeStepper() {
  const [step, setStep] = useState(0);
  const [keyPair, setKeyPair] = useState<StoredKeyPair | null>(null);
  const [issuer, setIssuer] = useState('');
  const [jws, setJws] = useState<string | null>(null);
  const [jwe, setJwe] = useState<string | null>(null);
  const [aesKey, setAesKey] = useState<Uint8Array | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [passcode, setPasscode] = useState('');
  const [expiryHours, setExpiryHours] = useState<string | number>('');
  const [exchangeResult, setExchangeResult] = useState<ExchangeResponse | null>(
    null,
  );

  useEffect(() => {
    const stored = loadKeyPair();
    if (stored) setKeyPair(stored);
    const storedIssuer = loadIssuer();
    if (storedIssuer) setIssuer(storedIssuer);
  }, []);

  function handleKeyPairChange(pair: StoredKeyPair) {
    setKeyPair(pair);
    saveKeyPair(pair);
    setJws(null);
    setJwe(null);
    setAesKey(null);
    setProof(null);
    setExchangeResult(null);
  }

  function handleIssuerChange(iss: string) {
    setIssuer(iss);
    saveIssuer(iss);
    setJws(null);
    setJwe(null);
    setAesKey(null);
    setProof(null);
    setExchangeResult(null);
  }

  function handleSign(signed: string) {
    setJws(signed);
    setJwe(null);
    setAesKey(null);
    setProof(null);
    setExchangeResult(null);
  }

  const handleEncrypted = useCallback(
    (encrypted: string, key: Uint8Array, proofJwt: string) => {
      setJwe(encrypted);
      setAesKey(key);
      setProof(proofJwt);
    },
    [],
  );

  function handleResult(result: ExchangeResponse) {
    setExchangeResult(result);
  }

  const canAdvance = (s: number) => {
    switch (s) {
      case 0:
        return !!keyPair && !!issuer;
      case 1:
        return !!jws;
      case 2:
        return !!jwe && !!aesKey;
      default:
        return false;
    }
  };

  return (
    <Stepper active={step} onStepClick={setStep}>
      <Stepper.Step label="Identity" description="Keys & issuer">
        <KeyManager
          keyPair={keyPair}
          issuer={issuer}
          onKeyPairChange={handleKeyPairChange}
          onIssuerChange={handleIssuerChange}
        />
        <StepNav
          step={0}
          canAdvance={canAdvance(0)}
          onBack={() => setStep(0)}
          onNext={() => setStep(1)}
        />
      </Stepper.Step>

      <Stepper.Step label="Sign" description="Sign bundle">
        <SigningStep
          keyPair={keyPair}
          issuer={issuer}
          jws={jws}
          onSign={handleSign}
        />
        <StepNav
          step={1}
          canAdvance={canAdvance(1)}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      </Stepper.Step>

      <Stepper.Step label="Encrypt" description="Encrypt & configure">
        <EncryptionStep
          jws={jws}
          keyPair={keyPair}
          issuer={issuer}
          jwe={jwe}
          proof={proof}
          label={label}
          passcode={passcode}
          expiryHours={expiryHours}
          onEncrypted={handleEncrypted}
          onLabelChange={setLabel}
          onPasscodeChange={setPasscode}
          onExpiryHoursChange={setExpiryHours}
        />
        <StepNav
          step={2}
          canAdvance={canAdvance(2)}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      </Stepper.Step>

      <Stepper.Step label="Send" description="Submit & share">
        <ExchangeResult
          jwe={jwe}
          aesKey={aesKey}
          proof={proof}
          label={label}
          passcode={passcode}
          expiryHours={expiryHours}
          exchangeResult={exchangeResult}
          onResult={handleResult}
        />
        {!exchangeResult && (
          <StepNav
            step={3}
            canAdvance={false}
            onBack={() => setStep(2)}
            onNext={() => {}}
            hideContinue
          />
        )}
      </Stepper.Step>
    </Stepper>
  );
}

function StepNav({
  step,
  canAdvance,
  onBack,
  onNext,
  hideContinue,
}: {
  step: number;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  hideContinue?: boolean;
}) {
  return (
    <Group justify="space-between" mt="xl">
      {step > 0 ? (
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={14} />}
          onClick={onBack}
        >
          Back
        </Button>
      ) : (
        <div />
      )}
      {!hideContinue && (
        <Button
          rightSection={<IconArrowRight size={14} />}
          onClick={onNext}
          disabled={!canAdvance}
        >
          Continue
        </Button>
      )}
    </Group>
  );
}
