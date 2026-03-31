import OrderConfirmationView from "@/components/OrderConfirmationView";

type OrderConfirmationByIdPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderConfirmationByIdPage({
  params,
}: OrderConfirmationByIdPageProps) {
  const { orderId } = await params;

  return <OrderConfirmationView orderId={orderId} />;
}
