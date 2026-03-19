'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { useReducedMotion } from '@/hooks/useReducedMotion';

import styles from './LandingTimelineExact.module.css';

const TOTAL_REVEAL_ITEMS = 4;
const ALL_VISIBLE_ITEMS = Array.from({ length: TOTAL_REVEAL_ITEMS }, () => true);
const ALL_HIDDEN_ITEMS = Array.from({ length: TOTAL_REVEAL_ITEMS }, () => false);

export function LandingTimelineExact() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [progress, setProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(ALL_HIDDEN_ITEMS);

  const resolvedProgress = prefersReducedMotion ? 1 : progress;
  const resolvedVisibleItems = prefersReducedMotion ? ALL_VISIBLE_ITEMS : visibleItems;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const startPoint = window.innerHeight * 0.5;

      let nextProgress = 0;
      if (sectionRect.top < startPoint) {
        nextProgress = (startPoint - sectionRect.top) / (sectionRect.height * 0.7);
      }

      setProgress(Math.max(0, Math.min(1, nextProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(entry.target.getAttribute('data-reveal-index'));
          setVisibleItems((current) => {
            if (current[index]) return current;

            const next = [...current];
            next[index] = true;
            return next;
          });

          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.15,
      }
    );

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const timelineFillStyle = { height: `${resolvedProgress * 100}%` };

  return (
    <section ref={sectionRef} id="how-it-works" className={styles.timelineSection}>
      <div className={styles.timelineHeader}>
        <h2>
          Gifting, <em>together</em>
        </h2>
      </div>

      <div className={styles.timelineContainer}>
        <div aria-hidden="true" className={styles.timelineLineContainer}>
          <div className={styles.timelineLineBackground} />
          <div className={styles.timelineLineFill} style={timelineFillStyle} />
        </div>

        <div
          ref={(node) => {
            stepRefs.current[0] = node;
          }}
          data-reveal-index="0"
          className={`${styles.timelineStep} ${resolvedVisibleItems[0] ? styles.visible : ''}`}
        >
          <div className={`${styles.timelineNode} ${styles.timelineNodeOne}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="8" width="18" height="13" rx="2" />
              <path d="M12 8V3" />
              <path d="M8 3c0 2.5 2 5 4 5" />
              <path d="M16 3c0 2.5-2 5-4 5" />
              <line x1="3" y1="13" x2="21" y2="13" />
            </svg>
          </div>

          <div className={styles.timelineContent}>
            <div className={styles.timelineStepLabel}>Step one</div>
            <div className={styles.timelineStepTitle}>Create a Dreamboard</div>
            <div className={styles.timelineStepDescription}>
              Let everyone know what you&apos;re raising for, choose your payout option, and
              your Dreamboard is ready to go live in minutes!
            </div>

            <div className={styles.miniForm}>
              <div className={styles.miniFormRow}>
                <div className={styles.miniFormLabel}>Child&apos;s name</div>
                <div className={`${styles.miniFormInput} ${styles.filledInput}`}>
                  Mia<span className={styles.cursorBlink} />
                </div>
              </div>

              <div className={styles.miniFormRow}>
                <div className={styles.miniFormLabel}>Dream gift</div>
                <div className={`${styles.miniFormInput} ${styles.filledInput}`}>
                  Ballet Starter Kit
                </div>
              </div>

              <div className={styles.miniFormRow}>
                <div className={styles.miniFormLabel}>Photo</div>
                <div className={styles.miniFormPhotoRow}>
                  <div className={styles.miniFormPhoto}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className={styles.miniFormPhotoText}>Add a photo to personalise</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={(node) => {
            stepRefs.current[1] = node;
          }}
          data-reveal-index="1"
          className={`${styles.timelineStep} ${resolvedVisibleItems[1] ? styles.visible : ''}`}
        >
          <div className={`${styles.timelineNode} ${styles.timelineNodeTwo}`}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </div>

          <div className={styles.timelineContent}>
            <div className={styles.timelineStepLabel}>Step two</div>
            <div className={styles.timelineStepTitle}>Share via WhatsApp</div>
            <div className={styles.timelineStepDescription}>
              Drop it in the group chat. Friends and family chip in any amount — turning
              little contributions into one big gift.
            </div>

            <div className={styles.whatsAppBubbleContainer}>
              <div className={styles.whatsAppChatHeader}>
                <div className={styles.whatsAppChatAvatar}>👨‍👩‍👧</div>
                <div>
                  <div className={styles.whatsAppChatName}>Family Group Chat</div>
                  <div className={styles.whatsAppChatMembers}>Mom, Dad, Nana, Uncle Tom, +4</div>
                </div>
              </div>

              <div className={styles.whatsAppBubble}>
                <div className={styles.whatsAppBubbleText}>
                  Hey fam! 🎉 We&apos;re pooling together for Mia&apos;s birthday gift — she&apos;s been
                  dying for a ballet kit. You can chip in here:
                </div>
                <div className={styles.whatsAppLinkPreview}>
                  <div className={styles.whatsAppLinkPreviewBar} />
                  <div className={styles.whatsAppLinkPreviewBody}>
                    <div className={styles.whatsAppLinkPreviewDomain}>gifta.co.za</div>
                    <div className={styles.whatsAppLinkPreviewTitle}>Mia&apos;s Dreamboard 🎁</div>
                    <div className={styles.whatsAppLinkPreviewDescription}>
                      Help fund Mia&apos;s Ballet Starter Kit — chip in any amount
                    </div>
                  </div>
                </div>
                <div className={styles.whatsAppTime}>14:32 ✓✓</div>
              </div>

              <div className={styles.whatsAppReactions}>
                <div className={styles.whatsAppReaction}>❤️</div>
                <div className={styles.whatsAppReaction}>🎉</div>
                <div className={styles.whatsAppReaction}>🩰</div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={(node) => {
            stepRefs.current[2] = node;
          }}
          data-reveal-index="2"
          className={`${styles.timelineStep} ${resolvedVisibleItems[2] ? styles.visible : ''}`}
        >
          <div className={`${styles.timelineNode} ${styles.timelineNodeThree}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.5 3.6 3.9.6-2.8 2.8.7 3.9L12 12l-3.3 1.9.7-3.9L6.6 7.2l3.9-.6Z" />
              <path d="M5 19l1-1" />
              <path d="M19 19l-1-1" />
              <path d="M12 17v4" />
              <path d="M8 21h8" />
            </svg>
          </div>

          <div className={styles.timelineContent}>
            <div className={styles.timelineStepLabel}>Step three</div>
            <div className={styles.timelineStepTitle}>Funds paid out securely</div>
            <div className={styles.timelineStepDescription}>
              When the Dreamboard closes, Gifta pays out directly to the host parent&apos;s
              bank account, or straight to the birthday child&apos;s Karri Card when available.
            </div>

            <div className={styles.miniPayout}>
              <div className={styles.miniPayoutTop}>
                <div className={styles.miniPayoutBrand}>
                  <span>🏦</span>
                  Gifta payout
                </div>
                <div className={styles.miniPayoutBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Secure
                </div>
              </div>

              <div className={styles.miniPayoutTitle}>Host parent bank account</div>
              <div className={styles.miniPayoutFor}>
                with a Karri Card option for the birthday child when they already have one.
              </div>
              <div className={styles.miniPayoutDestinations}>
                <div className={styles.miniPayoutChip}>Bank account</div>
                <div className={styles.miniPayoutChip}>Karri Card</div>
              </div>
              <div className={styles.miniPayoutPartner}>
                <Image
                  src="/images/homepage-exact/stitch_logo.svg"
                  alt="Stitch"
                  width={92}
                  height={18}
                  className={styles.miniPayoutPartnerLogo}
                />
                <span>Superpowered by Stitch.</span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={(node) => {
            stepRefs.current[3] = node;
          }}
          data-reveal-index="3"
          className={`${styles.timelineCoda} ${resolvedVisibleItems[3] ? styles.visible : ''}`}
        >
          <div className={styles.codaNode}>🎂</div>
          <div className={styles.codaContent}>
            <div>
              <div className={styles.codaStat}>3.4k+</div>
              <div className={styles.codaUnit}>Gifts</div>
            </div>
            <div className={styles.codaDivider} />
            <div className={styles.codaText}>
              Families across South Africa are already making gift-giving magic together
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
