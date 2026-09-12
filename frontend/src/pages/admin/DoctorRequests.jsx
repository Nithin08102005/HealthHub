import React, { useState, useEffect, useContext } from "react";
import { 
  UserCheck, ShieldAlert, Award, FileText, Check, X, 
  Phone, Mail, MapPin, DollarSign, Briefcase, ExternalLink, Loader2 
} from "lucide-react";
import { appContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const DoctorRequests = () => {
  const { token } = useContext(appContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores doctorId being actioned

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/pending-doctors`,
        { headers: { token } }
      );
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        toast.error("Failed to load doctor applications.");
      }
    } catch (error) {
      console.error("Error loading pending doctors:", error);
      toast.error("Something went wrong while loading requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingRequests();
    }
  }, [token]);

  const handleApprove = async (doctorId) => {
    const confirmAction = window.confirm("Are you sure you want to approve this doctor application?");
    if (!confirmAction) return;

    setActionLoading(doctorId);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/approve-doctor`,
        { doctorId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Doctor approved and activated!");
        setRequests(requests.filter((r) => r.id !== doctorId));
      } else {
        toast.error(response.data.message || "Failed to approve doctor.");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Error during approval.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId) => {
    const confirmAction = window.confirm("Are you sure you want to reject this doctor application?");
    if (!confirmAction) return;

    setActionLoading(doctorId);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/reject-doctor`,
        { doctorId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Doctor application rejected.");
        setRequests(requests.filter((r) => r.id !== doctorId));
      } else {
        toast.error(response.data.message || "Failed to reject doctor.");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Error during rejection.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Fetching doctor onboarding applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>Pending Onboarding Applications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review qualifications, certificates, and biography details before approving registration.
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl text-xs font-bold text-purple-300">
          Pending Requests: {requests.length}
        </div>
      </div>

      {/* Applications List */}
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col lg:flex-row gap-6 items-start hover:border-purple-500/30 transition-all"
            >
              
              {/* Profile Pic Preview (Left) */}
              <div className="w-full lg:w-40 flex-shrink-0 flex justify-center">
                {doc.image ? (
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl object-cover border border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500">
                    <UserCheck className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Bio & Details (Middle) */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wide">
                    {doc.specialization}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">Dr. {doc.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.qualification}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>{doc.phone || "No phone logged"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>{doc.experience_years} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Fee: {doc.consultation_fee} INR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{doc.address}</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Biography</span>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{doc.about || "No professional biography supplied."}"
                  </p>
                </div>
              </div>

              {/* Action Sidebar / Credentials (Right) */}
              <div className="w-full lg:w-60 flex-shrink-0 space-y-3 self-stretch flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                
                {/* Documents view */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Submitted Credentials</span>
                  {doc.document_url ? (
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3.5 bg-slate-950/70 hover:bg-slate-950 rounded-2xl border border-white/10 text-xs font-bold text-purple-300 hover:text-purple-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>View Certificate/Resume</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-65 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <div className="p-3 bg-slate-950/30 rounded-xl border border-white/5 text-[11px] text-slate-500 italic text-center">
                      No document upload found.
                    </div>
                  )}
                </div>

                {/* Approve/Reject Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleReject(doc.id)}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(doc.id)}
                    disabled={actionLoading !== null}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/15 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === doc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h4 className="text-white font-bold text-lg mb-1">No Pending Applications</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All medical practitioner onboarding requests have been processed. New doctor submissions will appear here.
          </p>
        </div>
      )}

    </div>
  );
};

export default DoctorRequests;
