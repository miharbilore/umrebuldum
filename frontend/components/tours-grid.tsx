"use client";

import { ListingCard } from "@/components/listing-card";
import { motion, Variants } from "framer-motion";

interface ToursGridProps {
  listings: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring", stiffness: 100, damping: 15, mass: 1
    }
  },
};

export function ToursGrid({ listings }: ToursGridProps) {
  const total = listings.length;

  if (!listings.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-8 py-20 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-2xl font-semibold text-foreground lg:text-3xl">Tur Bulunamadı</h3>
          <p className="mt-4 text-lg text-muted-foreground lg:text-xl">
            Aradığınız kriterlere uygun tur bulunamadı.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-8">
        <p className="text-lg text-muted-foreground lg:text-xl">
          <span className="font-semibold text-foreground">{total}</span> tur bulundu
        </p>
      </div>

      {/* Grid with Framer Motion Stagger */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {listings.map((listing) => {
          return (
            <motion.div key={listing.id} variants={itemVariants}>
              <ListingCard listing={listing} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
