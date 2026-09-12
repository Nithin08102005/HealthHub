import React, { useState } from "react";
import axios from "axios";
import { Plus, Trash2, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

const PrescriptionForm = ({ appointmentId, onClose, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      toast.error("At least one medicine must be prescribed!");
      return;
    }
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis.");
      return;
    }

    for (let med of medicines) {
      if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()) {
        toast.error("Please fill in all medicine fields.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/create-prescription`,
        {
          appointmentId,
          diagnosis,
          medicines,
          advice
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success("Prescription generated & emailed successfully!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.data.message || "Failed to generate prescription.");
      }
    } catch (error) {
      console.error("Prescription submit error:", error);
      toast.error("Something went wrong while submitting the prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-350">
        
        {/* Form Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Digital Prescription</h2>
              <p className="text-xs text-slate-400">Complete appointment by issuing prescription PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
          >
            Cancel
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* Diagnosis */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnosis / Symptoms Summary</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Migraine, Viral Fever, Post-op Follow-up"
              className="w-full p-4 bg-slate-950/60 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Prescribed Medicines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescribed Medicines</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-950/40 p-4 rounded-2xl border border-white/5 relative group">
                  
                  {/* Medicine Name */}
                  <div className="col-span-12 sm:col-span-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase sm:hidden">Medicine Name</span>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                      placeholder="e.g. Paracetamol 650mg"
                      className="w-full px-3 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Dosage */}
                  <div className="col-span-4 sm:col-span-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase sm:hidden">Dosage</span>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                      placeholder="e.g. 1 Tablet, 5ml"
                      className="w-full px-3 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Frequency */}
                  <div className="col-span-4 sm:col-span-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase sm:hidden">Frequency</span>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                      placeholder="e.g. 1-0-1, Once daily"
                      className="w-full px-3 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase sm:hidden">Duration</span>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                      placeholder="e.g. 5 Days"
                      className="w-full px-3 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 sm:col-span-1 flex justify-center pt-5 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice / Special Remarks */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor Remarks / Advice Notes</label>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="e.g. Drink plenty of water, complete the full antibiotic course, review in 7 days."
              className="w-full p-4 bg-slate-950/60 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-28"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Issue Prescription</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;
