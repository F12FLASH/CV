import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQ } from "@shared/schema";

export default function FAQs() {
  const { data: faqs = [], isLoading } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs?visible=true");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      return response.json();
    },
  });

  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about my services and work process
            </p>
          </motion.div>

          {sortedFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-lg">No FAQs available at the moment</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {sortedFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AccordionItem
                      value={`faq-${faq.id}`}
                      className="border rounded-lg px-6 bg-card data-[state=open]:shadow-md transition-shadow"
                      data-testid={`accordion-faq-${faq.id}`}
                    >
                      <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-5" data-testid={`trigger-faq-${faq.id}`}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed" data-testid={`content-faq-${faq.id}`}>
                        <div 
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                          className="
                            [&_p]:mb-3
                            [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-3
                            [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-3
                            [&_li]:mb-1
                            [&_a]:text-primary [&_a]:underline
                            [&_strong]:font-semibold
                          "
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center max-w-2xl mx-auto"
          >
            <div className="p-8 rounded-xl bg-muted/50 border">
              <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Feel free to reach out to me directly.
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                data-testid="link-contact-faq"
              >
                Contact Me
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
