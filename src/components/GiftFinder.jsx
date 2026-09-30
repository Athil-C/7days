import React, { useState, useMemo, useRef } from 'react';
import { Gift, RotateCcw, ArrowRight, ArrowLeft, Check, Sparkles, MessageCircle, SlidersHorizontal, ListOrdered } from 'lucide-react';
import { 
  AGE_GROUPS, 
  BUDGET_TIERS, 
  GIFT_OCCASIONS, 
  INTEREST_OPTIONS 
} from '../data/shoppingConfig';
import { getRecommendedProducts } from '../utils/shoppingEngine';
import ProductCard from './ProductCard';
import { createWhatsAppUrl, SHOP_FULL_NAME } from '../data/config';

export default function GiftFinder() {
  const resultsRef = useRef(null);
  const [filterMode, setFilterMode] = useState('instant'); // 'instant' (compact real-time) | 'wizard' (step-by-step)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAge, setSelectedAge] = useState('5-8');
  const [selectedOccasion, setSelectedOccasion] = useState('birthday');
  const [selectedInterest, setSelectedInterest] = useState('cars-rc');
  const [selectedBudget, setSelectedBudget] = useState('1000-2500');

  // Compute recommendations using the central recommendation engine
  const recommendations = useMemo(() => {
    return getRecommendedProducts({
      age: selectedAge,
      budget: selectedBudget,
      interest: selectedInterest,
      occasion: selectedOccasion
    });
  }, [selectedAge, selectedBudget, selectedInterest, selectedOccasion]);

  const ageObj = AGE_GROUPS.find(a => a.id === selectedAge);
  const occasionObj = GIFT_OCCASIONS.find(o => o.id === selectedOccasion);
  const interestObj = INTEREST_OPTIONS.find(i => i.id === selectedInterest);
  const budgetObj = BUDGET_TIERS.find(b => b.id === selectedBudget);

  const giftContext = {
    ageLabel: ageObj?.label || 'child',
    occasionLabel: occasionObj?.label || 'Birthday',
    budgetLabel: budgetObj?.label || ''
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedAge('5-8');
    setSelectedOccasion('birthday');
    setSelectedInterest('cars-rc');
    setSelectedBudget('1000-2500');
  };

  const handlePillSelect = (setter, value) => {
    setter(value);
    // On mobile, ensure results area is in view if scrolled past
    if (resultsRef.current && window.innerWidth < 768) {
      const rect = resultsRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.5) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <section id="gift-finder" className="py-12 sm:py-20 bg-gradient-to-b from-amber-50/50 to-white/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FB8500]/15 text-[#FB8500] text-xs font-bold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 fill-[#FB8500]" />
              <span>Interactive Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#263238] font-heading tracking-tight">
              Birthday &amp; Gift Finder
            </h2>
            <p className="text-[#546E7A] text-xs sm:text-base mt-1 max-w-xl">
              Select preferences to see instant gift ideas updated in real time below.
            </p>
          </div>

          {/* Mode Switcher: Instant Filter (default) vs Step-by-Step */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-white border border-black/10 p-1 rounded-full flex items-center gap-1 card-shadow">
              <button
                onClick={() => setFilterMode('instant')}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterMode === 'instant'
                    ? 'bg-[#FB8500] text-white shadow-2xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="Instant real-time filtering with visible products"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Instant Filter</span>
              </button>
              <button
                onClick={() => setFilterMode('wizard')}
                type="button"
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterMode === 'wizard'
                    ? 'bg-[#FB8500] text-white shadow-2xs'
                    : 'text-[#546E7A] hover:text-[#263238]'
                }`}
                title="Guided 4-step wizard"
              >
                <ListOrdered className="w-3 h-3" />
                <span>Step-by-Step</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center gap-1 bg-white hover:bg-black/5 border border-black/10 px-3 py-1.5 rounded-full text-xs font-bold text-[#546E7A] hover:text-[#263238] transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* METHOD 1: INSTANT COMPACT FILTER DECK (DEFAULT)          */}
        {/* Solves the issue: products are 100% visible on screen!   */}
        {/* ======================================================== */}
        {filterMode === 'instant' && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 card-shadow border border-black/5 mb-6 space-y-3 sm:space-y-4">
            
            {/* Row 1: Age */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#546E7A] uppercase tracking-wider min-w-[70px] shrink-0">
                Child Age:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {AGE_GROUPS.map(age => {
                  const isActive = selectedAge === age.id;
                  return (
                    <button
                      key={age.id}
                      onClick={() => handlePillSelect(setSelectedAge, age.id)}
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#FB8500] text-white border-[#FB8500] shadow-xs scale-102 ring-2 ring-[#FB8500]/20'
                          : 'bg-[#FFF9F0] text-[#263238] border-black/5 hover:border-black/15'
                      }`}
                    >
                      <span>{age.icon}</span>
                      <span>{age.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Occasion */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-black/5">
              <span className="text-[11px] font-extrabold text-[#546E7A] uppercase tracking-wider min-w-[70px] shrink-0">
                Occasion:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {GIFT_OCCASIONS.map(occ => {
                  const isActive = selectedOccasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => handlePillSelect(setSelectedOccasion, occ.id)}
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#FB8500] text-white border-[#FB8500] shadow-xs scale-102 ring-2 ring-[#FB8500]/20'
                          : 'bg-[#FFF9F0] text-[#263238] border-black/5 hover:border-black/15'
                      }`}
                    >
                      <span>{occ.icon}</span>
                      <span>{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Interest */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-black/5">
              <span className="text-[11px] font-extrabold text-[#546E7A] uppercase tracking-wider min-w-[70px] shrink-0">
                Interest:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {INTEREST_OPTIONS.map(int => {
                  const isActive = selectedInterest === int.id;
                  return (
                    <button
                      key={int.id}
                      onClick={() => handlePillSelect(setSelectedInterest, int.id)}
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#FB8500] text-white border-[#FB8500] shadow-xs scale-102 ring-2 ring-[#FB8500]/20'
                          : 'bg-[#FFF9F0] text-[#263238] border-black/5 hover:border-black/15'
                      }`}
                    >
                      <span>{int.icon}</span>
                      <span>{int.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Budget */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-black/5">
              <span className="text-[11px] font-extrabold text-[#546E7A] uppercase tracking-wider min-w-[70px] shrink-0">
                Budget:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                {BUDGET_TIERS.map(b => {
                  const isActive = selectedBudget === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handlePillSelect(setSelectedBudget, b.id)}
                      type="button"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#FB8500] text-white border-[#FB8500] shadow-xs scale-102 ring-2 ring-[#FB8500]/20'
                          : 'bg-[#FFF9F0] text-[#263238] border-black/5 hover:border-black/15'
                      }`}
                    >
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* METHOD 2: GUIDED STEP-BY-STEP WIZARD (OPTIONAL)          */}
        {/* ======================================================== */}
        {filterMode === 'wizard' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-7 card-shadow border border-black/5 mb-6">
            
            {/* Step Progress Tracker */}
            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              {[
                { step: 1, name: 'Age' },
                { step: 2, name: 'Occasion' },
                { step: 3, name: 'Interest' },
                { step: 4, name: 'Budget' }
              ].map(s => {
                const isPast = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step)}
                    type="button"
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                        isCurrent
                          ? 'bg-[#FB8500] text-white ring-4 ring-[#FB8500]/20 shadow-xs scale-105'
                          : isPast
                          ? 'bg-[#6A994E] text-white'
                          : 'bg-black/5 text-[#546E7A] group-hover:bg-black/10'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold ${isCurrent ? 'text-[#FB8500]' : 'text-[#546E7A]'}`}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: AGE */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#263238] font-heading mb-3">
                  Step 1: How old is the child?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AGE_GROUPS.map(age => (
                    <button
                      key={age.id}
                      onClick={() => setSelectedAge(age.id)}
                      type="button"
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedAge === age.id
                          ? 'border-[#FB8500] bg-amber-50/70 text-[#263238] shadow-xs ring-2 ring-[#FB8500]/20'
                          : 'border-black/5 bg-[#FFF9F0] text-[#263238] hover:border-black/15'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{age.icon}</span>
                      <span className="text-xs sm:text-sm font-extrabold font-heading">{age.label}</span>
                      <span className="text-[10px] text-[#546E7A]">{age.tagline}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: OCCASION */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#263238] font-heading mb-3">
                  Step 2: What is the special occasion?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {GIFT_OCCASIONS.map(occ => (
                    <button
                      key={occ.id}
                      onClick={() => setSelectedOccasion(occ.id)}
                      type="button"
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedOccasion === occ.id
                          ? 'border-[#FB8500] bg-amber-50/70 text-[#263238] shadow-xs ring-2 ring-[#FB8500]/20'
                          : 'border-black/5 bg-[#FFF9F0] text-[#263238] hover:border-black/15'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{occ.icon}</span>
                      <span className="text-xs sm:text-sm font-extrabold font-heading">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: INTEREST */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#263238] font-heading mb-3">
                  Step 3: What are they interested in?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTEREST_OPTIONS.map(int => (
                    <button
                      key={int.id}
                      onClick={() => setSelectedInterest(int.id)}
                      type="button"
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        selectedInterest === int.id
                          ? 'border-[#FB8500] bg-amber-50/70 text-[#263238] shadow-xs ring-2 ring-[#FB8500]/20'
                          : 'border-black/5 bg-[#FFF9F0] text-[#263238] hover:border-black/15'
                      }`}
                    >
                      <span className="text-xl shrink-0">{int.icon}</span>
                      <div>
                        <p className="text-xs font-bold font-heading leading-tight">{int.label}</p>
                        <p className="text-[9px] text-[#546E7A]">{int.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: BUDGET */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#263238] font-heading mb-3">
                  Step 4: What is your preferred budget?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUDGET_TIERS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBudget(b.id)}
                      type="button"
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedBudget === b.id
                          ? 'border-[#FB8500] bg-amber-50/70 text-[#263238] shadow-xs ring-2 ring-[#FB8500]/20'
                          : 'border-black/5 bg-[#FFF9F0] text-[#263238] hover:border-black/15'
                      }`}
                    >
                      <span className="text-sm font-extrabold font-heading text-[#FB8500]">{b.label}</span>
                      <p className="text-[11px] text-[#546E7A] mt-0.5">{b.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wizard Navigation Controls */}
            <div className="mt-5 pt-3.5 border-t border-black/5 flex items-center justify-between">
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#546E7A] hover:text-[#263238] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    type="button"
                    className="inline-flex items-center gap-1 bg-[#FFF9F0] hover:bg-black/5 border border-black/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#263238] cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    type="button"
                    className="inline-flex items-center gap-1 bg-[#FB8500] hover:bg-[#e07500] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    type="button"
                    className="inline-flex items-center gap-1 bg-[#6A994E] hover:bg-[#5a8640] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>View Ideas ({recommendations.length}) ↓</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Selected Criteria Summary Bar */}
        <div
          ref={resultsRef}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-black/5 card-shadow mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FB8500]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#263238] font-heading">
                Here are your personalized gift ideas ({recommendations.length} items)
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#546E7A] mt-0.5">
              Matching: <span className="font-semibold text-[#263238]">{ageObj?.label}</span> · <span className="font-semibold text-[#263238]">{occasionObj?.label}</span> · <span className="font-semibold text-[#263238]">{interestObj?.label}</span> · <span className="font-semibold text-[#263238]">{budgetObj?.label}</span>
            </p>
          </div>

          <a
            href={createWhatsAppUrl(`Hi ${SHOP_FULL_NAME},\n\nI'm looking for a ${occasionObj?.label.toLowerCase()} gift for a ${ageObj?.label} with a budget of ${budgetObj?.label} (interested in ${interestObj?.label}). Could you suggest what's currently available?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-colors self-start md:self-center shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Ask 7Days for Suggestions</span>
          </a>
        </div>

        {/* Matched Product Cards with smooth re-render */}
        <div key={`${selectedAge}-${selectedOccasion}-${selectedInterest}-${selectedBudget}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fadeIn">
          {recommendations.slice(0, 4).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              giftContext={giftContext} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}
