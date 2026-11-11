import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Check, Lock, ArrowUpRight } from 'lucide-react';
import { ChecklistItem, EscrowProject, UserRole, VerificationType } from '../types/escrow';

interface ContractChecklistSectionProps {
  project: EscrowProject;
  role: UserRole;
  isGeneratingChecklist: boolean;
  onUpdateProjectMeta: (fields: {
    title: string;
    brief: string;
    amount: number;
    deadline: string;
  }) => void;
  onGenerateChecklist: () => void;
  onUpdateChecklistItem: (id: string, patch: Partial<ChecklistItem>) => void;
  onAddChecklistItem: (item: ChecklistItem) => void;
  onDeleteChecklistItem: (id: string) => void;
  onApproveAllForRole: (targetRole: UserRole) => void;
  onOpenPayPalModal: () => void;
}

export const ContractChecklistSection: React.FC<ContractChecklistSectionProps> = ({
  project,
  role,
  isGeneratingChecklist,
  onUpdateProjectMeta,
  onGenerateChecklist,
  onUpdateChecklistItem,
  onAddChecklistItem,
  onDeleteChecklistItem,
  onApproveAllForRole,
  onOpenPayPalModal,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCriterion, setNewCriterion] = useState('');
  const [newType, setNewType] = useState<VerificationType>('OBJECTIVE');
  const [newWeight, setNewWeight] = useState(20);

  const totalWeight = project.checklist.reduce((s, i) => s + Number(i.weight || 0), 0);
  const allClientApproved =
    project.checklist.length > 0 && project.checklist.every((i) => i.clientApproved);
  const allFreelancerApproved =
    project.checklist.length > 0 && project.checklist.every((i) => i.freelancerApproved);
  const bothApproved = allClientApproved && allFreelancerApproved;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const nextIdx = project.checklist.length + 1;
    onAddChecklistItem({
      id: `CHK-0${nextIdx}`,
      title: newTitle.trim(),
      criterion: newCriterion.trim() || 'Verify deliverable against project brief.',
      verificationType: newType,
      weight: Number(newWeight) || 20,
      clientApproved: role === 'CLIENT',
      freelancerApproved: role === 'FREELANCER',
      status: 'PENDING',
    });
    setNewTitle('');
    setNewCriterion('');
  };

  return (
    <section
      id="contract-section"
      className="border border-[#08090B] bg-[#FAF8F3] text-[#08090B]"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-6 border-b border-[#08090B]">
        <div>
          <div className="font-mono-tech text-[11px] text-[#8A8780] mb-1">
            01. CONTRACT BRIEF &amp; GEMINI STRUCTURED CHECKLIST (RESPONSESCHEMA)
          </div>
          <h2 className="font-anton text-4xl md:text-5xl leading-none text-[#08090B]">
            PROJECT SCOPE &amp; BILATERAL SIGN-OFF
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onGenerateChecklist}
            disabled={isGeneratingChecklist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#08090B] bg-[#FAF8F3] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-xs transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
            {isGeneratingChecklist
              ? 'GENERATING SCHEMA...'
              : 'GENERATE AI CHECKLIST (JSON SCHEMA)'}
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenPayPalModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#08090B] bg-[#08090B] text-[#FAF8F3] hover:bg-[#CDF22B] hover:text-[#08090B] font-mono-tech text-xs font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-[#FFC900]" />
            {project.paypal.status === 'AUTHORIZED'
              ? `FUNDED: $${project.amount.toFixed(2)} HELD`
              : `FUND ESCROW ($${project.amount.toFixed(2)} AUTHORIZE)`}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Asymmetric 12-Col Split: Left 5 Cols Brief + Amount, Right 7 Cols Editable Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 5 Columns: Brief, Amount, Deadline */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#08090B] p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                CONTRACT TITLE
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) =>
                  onUpdateProjectMeta({
                    title: e.target.value,
                    brief: project.brief,
                    amount: project.amount,
                    deadline: project.deadline,
                  })
                }
                className="w-full bg-transparent border-b-2 border-[#08090B] py-1.5 font-anton text-2xl text-[#08090B] focus:outline-none focus:border-[#CDF22B]"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                PROJECT BRIEF (SENT TO GEMINI RESPONSESCHEMA)
              </label>
              <textarea
                rows={4}
                value={project.brief}
                onChange={(e) =>
                  onUpdateProjectMeta({
                    title: project.title,
                    brief: e.target.value,
                    amount: project.amount,
                    deadline: project.deadline,
                  })
                }
                className="w-full bg-transparent border border-[#08090B] p-3 text-sm font-inter text-[#08090B] focus:outline-none focus:border-[#CDF22B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                  ESCROW AMOUNT (USD)
                </label>
                <div className="flex items-baseline border-b-2 border-[#08090B] focus-within:border-[#CDF22B]">
                  <span className="font-anton text-3xl text-[#08090B] mr-1">$</span>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={project.amount}
                    onChange={(e) =>
                      onUpdateProjectMeta({
                        title: project.title,
                        brief: project.brief,
                        amount: Math.max(1, Number(e.target.value) || 0),
                        deadline: project.deadline,
                      })
                    }
                    className="w-full bg-transparent py-1 font-anton text-3xl text-[#08090B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                  DELIVERY DEADLINE
                </label>
                <input
                  type="date"
                  value={project.deadline}
                  onChange={(e) =>
                    onUpdateProjectMeta({
                      title: project.title,
                      brief: project.brief,
                      amount: project.amount,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b-2 border-[#08090B] py-2 font-mono-tech text-sm text-[#08090B] focus:outline-none focus:border-[#CDF22B]"
                />
              </div>
            </div>
          </div>

          {/* Bilateral Approval Status Slab */}
          <div className="p-4 border border-[#08090B] bg-[#08090B] text-[#FAF8F3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-[10px] text-[#8A8780]">
                BILATERAL CHECKLIST LOCK
              </span>
              <span
                className={`font-mono-tech text-[10px] ${
                  bothApproved ? 'text-[#CDF22B]' : 'text-[#FFC900]'
                }`}
              >
                {bothApproved ? 'LOCKED & APPROVED BY BOTH' : 'AWAITING DUAL APPROVAL'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onApproveAllForRole('CLIENT')}
                className={`flex items-center justify-between px-3 py-2 border font-mono-tech text-[10px] transition-colors ${
                  allClientApproved
                    ? 'border-[#CDF22B] text-[#CDF22B]'
                    : 'border-[#FAF8F3]/30 text-[#FAF8F3] hover:border-[#CDF22B]'
                }`}
              >
                <span>CLIENT SIGN-OFF</span>
                <Check className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onApproveAllForRole('FREELANCER')}
                className={`flex items-center justify-between px-3 py-2 border font-mono-tech text-[10px] transition-colors ${
                  allFreelancerApproved
                    ? 'border-[#CDF22B] text-[#CDF22B]'
                    : 'border-[#FAF8F3]/30 text-[#FAF8F3] hover:border-[#CDF22B]'
                }`}
              >
                <span>FREELANCER SIGN-OFF</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Editable Testable Checklist */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="px-6 py-3.5 border-b border-[#08090B]/15 flex items-center justify-between font-mono-tech text-[10px] text-[#8A8780]">
              <span>TESTABLE MILESTONE ITEMS ({project.checklist.length})</span>
              <span className={totalWeight === 100 ? 'text-[#08090B]' : 'text-[#FF6845]'}>
                TOTAL WEIGHT: {totalWeight}% {totalWeight !== 100 && '(NORMALIZED IN CODE)'}
              </span>
            </div>

            {isGeneratingChecklist ? (
              <div className="p-6 space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 border border-[#08090B]/15 bg-[#08090B]/5" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[#08090B]/15">
                {project.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 hover:bg-[#08090B]/[0.02] transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tech text-xs font-bold text-[#08090B]">
                          {item.id}
                        </span>
                        <select
                          value={item.verificationType}
                          onChange={(e) =>
                            onUpdateChecklistItem(item.id, {
                              verificationType: e.target.value as VerificationType,
                            })
                          }
                          className="font-mono-tech text-[10px] border border-[#08090B]/30 bg-transparent px-2 py-0.5 text-[#08090B] focus:outline-none"
                        >
                          <option value="OBJECTIVE">OBJECTIVE (AI VERIFIABLE)</option>
                          <option value="SUBJECTIVE">SUBJECTIVE (HUMAN GUARDRAIL)</option>
                        </select>

                        <div className="flex items-center gap-1 font-mono-tech text-[10px] text-[#8A8780]">
                          <span>WEIGHT:</span>
                          <input
                            type="number"
                            min={5}
                            max={100}
                            value={item.weight}
                            onChange={(e) =>
                              onUpdateChecklistItem(item.id, {
                                weight: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 border-b border-[#08090B] bg-transparent text-center font-mono-tech text-xs text-[#08090B]"
                          />
                          <span>%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateChecklistItem(item.id, {
                              clientApproved: !item.clientApproved,
                            })
                          }
                          className={`px-2.5 py-0.5 rounded-full border font-mono-tech text-[10px] ${
                            item.clientApproved
                              ? 'border-[#08090B] bg-[#CDF22B] text-[#08090B]'
                              : 'border-[#08090B]/30 text-[#8A8780]'
                          }`}
                        >
                          CLIENT {item.clientApproved ? 'OK' : 'PENDING'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onUpdateChecklistItem(item.id, {
                              freelancerApproved: !item.freelancerApproved,
                            })
                          }
                          className={`px-2.5 py-0.5 rounded-full border font-mono-tech text-[10px] ${
                            item.freelancerApproved
                              ? 'border-[#08090B] bg-[#CDF22B] text-[#08090B]'
                              : 'border-[#08090B]/30 text-[#8A8780]'
                          }`}
                        >
                          FREELANCER {item.freelancerApproved ? 'OK' : 'PENDING'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteChecklistItem(item.id)}
                          className="p-1 text-[#8A8780] hover:text-[#FF6845] transition-colors"
                          title="Delete checklist item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        onUpdateChecklistItem(item.id, { title: e.target.value })
                      }
                      className="w-full bg-transparent font-inter font-semibold text-sm text-[#08090B] focus:outline-none focus:underline"
                    />

                    <input
                      type="text"
                      value={item.criterion}
                      onChange={(e) =>
                        onUpdateChecklistItem(item.id, { criterion: e.target.value })
                      }
                      className="w-full bg-transparent font-inter text-xs text-[#8A8780] focus:outline-none focus:text-[#08090B]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Criterion Bar */}
          <form
            onSubmit={handleAddItem}
            className="p-5 border-t border-[#08090B] bg-[#FAF8F3] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-4">
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                NEW MILESTONE ITEM
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Brand Guidelines PDF"
                className="w-full bg-transparent border-b-2 border-[#08090B] py-1 text-xs font-inter focus:outline-none focus:border-[#CDF22B]"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                VERIFICATION RULE
              </label>
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="e.g., Must include hex codes & typography"
                className="w-full bg-transparent border-b-2 border-[#08090B] py-1 text-xs font-inter focus:outline-none focus:border-[#CDF22B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1">
                TYPE
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as VerificationType)}
                className="w-full bg-transparent border-b-2 border-[#08090B] py-1 font-mono-tech text-[10px] focus:outline-none"
              >
                <option value="OBJECTIVE">OBJECTIVE</option>
                <option value="SUBJECTIVE">SUBJECTIVE</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-[#08090B] bg-[#FAF8F3] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-[10px] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3 h-3" />
                ADD ITEM
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
