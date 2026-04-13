import { Inngest } from "inngest";

// Ensure a single instance across hot-reloads in dev
export const inngest = new Inngest({ id: "umrebuldum-platform" });
