import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import {
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Users,
  TrendingUp,
  BookOpen,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface TeacherDashboardScreenProps {
  onNavigate: (screen: any) => void;
}

export function TeacherDashboardScreen({ onNavigate }: TeacherDashboardScreenProps) {
  const [assignedTopic, setAssignedTopic] = useState<string | null>(null);
  const [isUpdatingModel, setIsUpdatingModel] = useState(false);
  const [modelUpdated, setModelUpdated] = useState(false);

  const handleUpdateModel = () => {
    setIsUpdatingModel(true);
    setTimeout(() => {
      setIsUpdatingModel(false);
      setModelUpdated(true);
      setTimeout(() => setModelUpdated(false), 3000);
    }, 1200);
  };

  const handleAssign = (topic: string) => {
    setAssignedTopic(topic);
    setTimeout(() => setAssignedTopic(null), 3000);
  };

  return (
    <div className="flex flex-col py-6 px-4 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Teacher Intelligence Hub
            </span>
            <span className="text-xs text-slate-400">Term 2 Forecasting</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">
            Predictive Gap Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Class 8 Mathematics · Global Student Cohort Analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('bulk-scanning')}
            className="gap-2 text-teal-300 border-teal-500/30 hover:bg-teal-950/40"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Bulk Scanner</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            glow
            onClick={handleUpdateModel}
            disabled={isUpdatingModel}
            className="gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isUpdatingModel ? 'animate-spin' : ''}`} />
            <span>
              {isUpdatingModel
                ? 'Retraining on Scans...'
                : modelUpdated
                ? 'Model Synced ✓'
                : 'Update AI Model'}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Grid: Heatmap + Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Knowledge Heatmap */}
        <Card className="lg:col-span-8 glass-card flex flex-col h-[420px] p-5">
          <div className="mb-3">
            <h3 className="font-headline text-lg font-bold text-white">
              Knowledge Heatmap: Class 8 Math
            </h3>
            <p className="text-xs text-slate-400">
              Real-time conceptual density and student misconception distribution.
            </p>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 relative flex items-center justify-center p-2">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0sGMY1V8qhBqmQGVJ0UfL-wW5Jy92rxjGfMr93kf1fg7scSGGgWKqKBRB4yFCt1v5-54f1MTplW_M4Tyo7gsUqxrWmc47qC5az01Mi0NGd1XDhhbnBnt-TzRQQ0sMLUfmTFpM0jJgCeUgcY1XwRRT8Y_JFXZe90r9HxaXF_uK4Ux8vTESS4ixL_gfiHB06PWEupmMOsVJf1iHdL2ugba5wzLUjXiapMMNwH0zfSA_BN11-O4bqNc_"
              alt="Knowledge Heatmap showing student mastery distribution across topics"
              className="w-full h-full object-cover rounded-xl opacity-90"
            />
            {/* Heatmap overlay label */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
              Density: <span className="text-amber-400 font-bold">Fractions & Variables</span> cluster
              flagged
            </div>
          </div>
        </Card>

        {/* Proficiency Projection */}
        <Card className="lg:col-span-4 glass-card flex flex-col justify-between h-[420px] p-6">
          <div>
            <h3 className="font-headline text-lg font-bold text-white mb-1">
              Proficiency Projection
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Empirical forecast based on Socratic remedial intervention.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 mb-6 space-y-2">
              <span className="text-xs text-slate-400">Projected Cohort Growth</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl font-bold text-emerald-400 tabular-nums">
                  +42%
                </span>
                <span className="text-xs text-slate-400">Expected Score Lift</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Foundational Math */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>Current Foundational Mastery</span>
                <span className="text-slate-200 tabular-nums">43%</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: '43%' }} />
              </div>
            </div>

            {/* Projected with AI Support */}
            <div>
              <div className="flex justify-between text-xs font-bold text-teal-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Projected with AI Loophole Support</span>
                </span>
                <span className="tabular-nums">85%</span>
              </div>
              <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 rounded-full shadow-lg relative flex items-center justify-end pr-1"
                  style={{ width: '85%' }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Predicted Loopholes This Week Table */}
      <Card className="glass-card overflow-hidden border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Predicted Conceptual Bottlenecks This Week</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              AI identified potential syllabus hurdles based on homework scans and quiz evaluations.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Upcoming Topic Bottleneck</th>
                <th className="py-4 px-6">Impacted Students</th>
                <th className="py-4 px-6">Recommended Prerequisite Review</th>
                <th className="py-4 px-6 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <span>Fraction Operations (Div/Mult)</span>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <span className="font-bold text-white tabular-nums">24</span> (60% of class)
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs">
                    Unit 3: Basic Equivalencies
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant={assignedTopic === 'fractions' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleAssign('fractions')}
                  >
                    {assignedTopic === 'fractions' ? 'Assigned to Class ✓' : 'Assign Review'}
                  </Button>
                </td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <span>Intro to Linear Equations</span>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <span className="font-bold text-white tabular-nums">15</span> (37% of class)
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    Unit 4: Variables & Expressions
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button
                    variant={assignedTopic === 'linear' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleAssign('linear')}
                  >
                    {assignedTopic === 'linear' ? 'Assigned to Class ✓' : 'Assign Review'}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
