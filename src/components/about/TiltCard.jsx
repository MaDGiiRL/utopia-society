import { motion, useMotionValue, useSpring } from "framer-motion";

export default function TiltCard({ title, color, text, idx }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(y, { stiffness: 120, damping: 16 });
  const rotateY = useSpring(x, { stiffness: 120, damping: 16 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (offsetX - centerX) / centerX;
    const normY = (offsetY - centerY) / centerY;

    x.set(normX * 10);
    y.set(-normY * 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
      style={{
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden text-justify rounded-2xl border border-white/10 bg-slate-900/60 p-5 px-7 backdrop-blur group transform-gpu will-change-transform"
    >
      <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-20 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-24 transition duration-700" />

      <div className="relative">
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <p className="mt-2 text-xs text-slate-300">{text}</p>
      </div>
    </motion.div>
  );
}
