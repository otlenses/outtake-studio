import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import QuotationPage from "@/components/QuotationPage";

export default function Quotation() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <QuotationPage />
      </main>
    </div>
  );
}
