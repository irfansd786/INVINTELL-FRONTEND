import React from 'react';
import { motion } from 'framer-motion';
import { Database, ListChecks, Clock, ArrowRight } from 'lucide-react';

export default function Challenge() {
  const problems = [
    {
      num: '01',
      title: 'Too Much Data',
      desc: 'Inventory, orders and warehouse activity create large amounts of operational data that are difficult to see in one place.',
      icon: Database,
    },
    {
      num: '02',
      title: 'Hard to Prioritize',
      desc: 'Teams need to know which order, product or warehouse needs attention first.',
      icon: ListChecks,
    },
    {
      num: '03',
      title: 'Reactive Decisions',
      desc: 'Problems are often discovered after they affect inventory, fulfillment or delivery.',
      icon: Clock,
    },
  ];

  return (
    <section className="inv-challenge-section">
      <div className="inv-section-container">
        <div className="inv-section-header-center">
          <div className="inv-section-label">THE CHALLENGE</div>
          <h2 className="inv-section-heading">Managing warehouses is complex.</h2>
        </div>

        <div className="inv-challenge-row">
          {problems.map((prob, index) => {
            const Icon = prob.icon;
            return (
              <React.Fragment key={prob.num}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="inv-challenge-item-pic2"
                >
                  {/* Left Big Icon Box */}
                  <div className="inv-challenge-icon-box">
                    <Icon size={26} strokeWidth={1.75} color="#FFFFFF" />
                  </div>

                  {/* Content Right */}
                  <div className="inv-challenge-item-content">
                    <div className="inv-challenge-badge-num">{prob.num}</div>
                    <h3 className="inv-challenge-item-title">{prob.title}</h3>
                    <p className="inv-challenge-item-desc">{prob.desc}</p>
                  </div>
                </motion.div>

                {/* Horizontal Arrow between items */}
                {index < problems.length - 1 && (
                  <div className="inv-challenge-arrow">
                    <ArrowRight size={18} color="#71717A" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
