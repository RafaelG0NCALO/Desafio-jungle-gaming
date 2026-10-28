import { useRef, useState } from "react";
import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiErrorMessage, type Cart } from "@/api/cart";
import {
  createOrder,
  isRevalidation,
  isWalletDisconnected,
  type CreateOrderInput,
} from "@/api/orders";
import { useOwner } from "@/features/auth/session";
import { cartKeys } from "@/features/cart/hooks";
import { connectionKeys } from "@/features/wallets/connection";
import { clearDraft } from "./draft";
import type { CheckoutValues } from "./schema";

function toOrderInput(values: CheckoutValues, cart: Cart): CreateOrderInput {
  return {
    collector: {
      displayName: values.displayName,
      username: values.username,
      profileName: values.profileName,
      email: values.email,
      referralCode: values.referralCode,
      ensName: `${values.username}${values.ensSuffix}`,
      note: values.note || undefined,
    },
    wallet: {
      type: values.walletType,
      network: values.network,
      address: values.walletAddress,
      secondary: values.secondaryWallet || undefined,
      useOtherWallet: values.useOtherWallet,
    },
    reviewed: {
      total: cart.quote.total,
      prices: Object.fromEntries(
        cart.items.map((item) => [item.id, item.unitPrice]),
      ),
    },
  };
}

export interface CheckoutFeedback {
  message: string;
  changes: string[];
  needsCartFix: boolean;
}

const NONE: CheckoutFeedback = {
  message: "",
  changes: [],
  needsCartFix: false,
};

export function useCheckout(
  form: UseFormReturn<CheckoutValues>,
  cart: Cart | undefined,
  walletConnected: boolean,
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const owner = useOwner();
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const [feedback, setFeedback] = useState<CheckoutFeedback>(NONE);

  const mutation = useMutation({
    mutationFn: ({ input, key }: { input: CreateOrderInput; key: string }) =>
      createOrder(input, key),
    onSuccess: (order) => {
      clearDraft(owner);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      navigate({ to: "/pedido/$id", params: { id: order.id } });
    },
    onError: (error) => {
      if (isRevalidation(error)) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all });
        const body = error.response!.data;
        setFeedback({
          message: body.message,
          changes: body.changes.map((change) => change.message),
          needsCartFix: body.code === "availability_conflict",
        });
        return;
      }
      if (isWalletDisconnected(error)) {
        queryClient.invalidateQueries({ queryKey: connectionKeys.all });
        setFeedback({
          message: apiErrorMessage(error, "A carteira não está conectada."),
          changes: [],
          needsCartFix: false,
        });
        return;
      }
      setFeedback({
        message: apiErrorMessage(
          error,
          "Não foi possível enviar o pedido. Tente novamente.",
        ),
        changes: [],
        needsCartFix: false,
      });
    },
  });

  const submit = (event?: BaseSyntheticEvent) =>
    form.handleSubmit((values) => {
      if (mutation.isPending || !cart) return;
      if (!walletConnected) {
        setFeedback({
          message: "Conecte sua carteira para confirmar a compra.",
          changes: [],
          needsCartFix: false,
        });
        return;
      }
      setFeedback(NONE);
      const input = toOrderInput(values, cart);
      const body = JSON.stringify(input);
      if (attempt.current?.body !== body)
        attempt.current = { body, key: crypto.randomUUID() };
      mutation.mutate({ input, key: attempt.current.key });
    })(event);

  return { submit, isPending: mutation.isPending, feedback };
}
