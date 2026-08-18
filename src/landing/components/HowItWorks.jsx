import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'CONNECT',
      desc: 'Connect warehouse and operational data.',
    },
    {
      num: '02',
      title: 'ORGANIZE',
      desc: 'Bring inventory and orders into one view.',
    },
    {
      num: '03',
      title: 'ANALYZE',
      desc: 'Understand current warehouse activity.',
    },
    {
      num: '04',
      title: 'PREDICT',
      desc: 'Identify future demand and potential risks.',
    },
    {
      num: '05',
      title: 'ACT',
      desc: 'Make faster operational decisions.',
    },
  ];

  return (
    <section id="how-it-works" className="inv-howitworks-section">
      <div className="inv-section-container">
        <div className="inv-section-label">HOW IT WORKS</div>
        <h2 className="inv-section-heading">Simple operations. Better decisions.</h2>

        <div className="inv-timeline-desktop">
          {steps.map((step, index) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="inv-timeline-step"
            >
              <div className="inv-step-node">{step.num}</div>
              <h3 className="inv-step-title">{step.title}</h3>
              <p className="inv-step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
