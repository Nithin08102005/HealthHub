import React, { useState } from "react";
import { Sparkles, X, BrainCircuit, Activity, ArrowRight, AlertTriangle } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AISymptomChecker = ({ isOpen, onClose }) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/ai-symptom-check`,
        { symptoms },
        { headers: { token } }
      );

      if (response.data.success) {
        setResult(response.data);
        toast.success("Analysis complete!");
      } else {
        toast.error(response.data.message || "Failed to analyze symptoms.");
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      toast.error(error.response?.data?.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctors = () => {
    if (result?.suggestedSpecialty) {
      navigate(`/patient/doctors?specialty=${encodeURIComponent(result.suggestedSpecialty)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  const urgencyColors = {
    High: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-1.5">
                AI Diagnostics Helper
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">Describe symptoms & find specialized care</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto relative z-10">
          
          {!result && (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  How are you feeling today?
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail (e.g. 'I have a dry cough, low-grade fever, and mild chest discomfort for the last two days.')"
                  rows={4}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm resize-none"
                  required
                />
              </div>

              {/* Medical Disclaimer Banner */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Standard Medical Disclaimer:</strong> The AI diagnostic helper is a guideline tool designed to help you locate target specialties. It does not replace professional medical evaluations. Always seek immediate emergency services for severe concerns.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Analyze Symptoms</span>
                  </>
                )}
              </button>
            </form>
          )}

          {result && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Urgency and Specialty Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Suggested Specialty
                  </span>
                  <span className="text-md font-bold text-white block">
                    {result.suggestedSpecialty}
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Assessed Urgency
                  </span>
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgencyColors[result.urgency] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                    {result.urgency} Urgency
                  </span>
                </div>
              </div>

              {/* Analysis Text Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Clinical Summary</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.analysis}
                </p>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFindDoctors}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer group"
                >
                  <span>Find Recommended {result.suggestedSpecialty}s</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => {
                    setResult(null);
                    setSymptoms("");
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 py-3 rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Analyze New Symptoms
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AISymptomChecker;
