import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
