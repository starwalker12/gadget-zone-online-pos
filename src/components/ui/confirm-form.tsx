"use client";

import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState, useRef, type FormEvent, type ReactNode } from "react";

export function ConfirmForm({
  action,
  message,
  title = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  children,
}: {
  action: (formData: FormData) => void;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  children: ReactNode;
}) {
  const confirm = useConfirmDialog();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmedSubmitRef = useRef(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (confirmedSubmitRef.current) {
      confirmedSubmitRef.current = false;
      return;
    }

    e.preventDefault();

    if (isConfirming || isSubmitting) return;

    const form = e.currentTarget;
    setIsConfirming(true);

    const shouldProceed = await confirm({
      title,
      message,
      confirmLabel,
      cancelLabel,
      variant,
    });

    setIsConfirming(false);

    if (!shouldProceed) return;

    confirmedSubmitRef.current = true;
    setIsSubmitting(true);
    form.requestSubmit();

    // Reset submitting state after submission starts
    setTimeout(() => setIsSubmitting(false), 1000);
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
