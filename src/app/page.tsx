"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Code2,
  Award,
  ClipboardList,
  Sparkles,
  Waypoints,
  Loader2,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import type { ProfileFormData, CareerRecommendation, CareerPathway } from '@/lib/types';
import { generateCareerRecommendations } from '@/ai/flows/generate-career-recommendations';
import { suggestCareerPathways } from '@/ai/flows/suggest-career-pathways';

const profileFormSchema = z.object({
  academic: z.object({
    cgpa: z.string().min(1, "CGPA is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid CGPA format (e.g., 8.75)"),
    major: z.string().min(1, "Major/department is required"),
    academicStrengths: z.string().min(1, "Academic strengths are required"),
    academicWeaknesses: z.string().min(1, "Academic weaknesses are required"),
  }),
  coding: z.object({
    githubUsername: z.string().optional(),
    codingPlatformUsername: z.string().optional(),
    programmingLanguages: z.string().min(1, "Programming languages are required"),
    keyProjects: z.string().min(1, "Key projects are required"),
    codingPlatformStats: z.string().optional(),
  }),
  extracurricular: z.object({
    certifications: z.string().optional(),
    eventsParticipated: z.string().optional(),
    hackathonExperience: z.string().optional(),
    leadershipRoles: z.string().optional(),
  }),
  skills: z.string().min(1, "Skills are required (comma-separated)"),
});

const defaultProfileValues: ProfileFormData = {
  academic: {
    cgpa: "",
    major: "",
    academicStrengths: "",
    academicWeaknesses: "",
  },
  coding: {
    githubUsername: "",
    codingPlatformUsername: "",
    programmingLanguages: "",
    keyProjects: "",
    codingPlatformStats: "",
  },
  extracurricular: {
    certifications: "",
    eventsParticipated: "",
    hackathonExperience: "",
    leadershipRoles: "",
  },
  skills: "",
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation | null>(null);
  const [pathways, setPathways] = useState<CareerPathway | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues,
  });

  const { control, handleSubmit, reset, formState: { errors } } = form;

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setRecommendations(null);
    setPathways(null);

    const academicPerformanceSummary = `CGPA: ${data.academic.cgpa}, Major: ${data.academic.major}. Strengths: ${data.academic.academicStrengths}. Weaknesses: ${data.academic.academicWeaknesses}.`;
    const codingSkillsSummary = `Languages & Frameworks: ${data.coding.programmingLanguages}. Notable Projects: ${data.coding.keyProjects}. GitHub: ${data.coding.githubUsername || 'N/A'}. Coding Platform (${data.coding.codingPlatformUsername || 'N/A'}): ${data.coding.codingPlatformStats || 'N/A'}.`;
    const extracurricularActivitiesSummary = `Certifications: ${data.extracurricular.certifications || 'N/A'}. Events: ${data.extracurricular.eventsParticipated || 'N/A'}. Hackathons: ${data.extracurricular.hackathonExperience || 'N/A'}. Leadership: ${data.extracurricular.leadershipRoles || 'N/A'}.`;
    const codingStatsSummary = `GitHub: ${data.coding.githubUsername || 'N/A'}. Platform (${data.coding.codingPlatformUsername || 'N/A'}) Stats: ${data.coding.codingPlatformStats || 'N/A'}. Languages: ${data.coding.programmingLanguages}. Key Projects: ${data.coding.keyProjects}.`;

    try {
      const [recs, paths] = await Promise.all([
        generateCareerRecommendations({
          academicPerformance: academicPerformanceSummary,
          codingSkills: codingSkillsSummary,
          extracurricularActivities: extracurricularActivitiesSummary,
        }),
        suggestCareerPathways({
          academicPerformance: academicPerformanceSummary,
          codingStats: codingStatsSummary,
          extracurricularActivities: extracurricularActivitiesSummary,
          skills: data.skills,
        }),
      ]);

      setRecommendations(recs);
      setPathways(paths);

      toast({
        title: "Insights Generated!",
        description: "Your personalized recommendations and career pathways are ready.",
      });
    } catch (error) {
      console.error("AI processing error:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Insights",
        description: "An error occurred while processing your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Your Employability Dashboard</h2>
        <p className="text-muted-foreground">
          Fill in your details to get AI-powered insights and career suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Forms Column */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary" /> Academic Performance</CardTitle>
                <CardDescription>Enter your academic details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField name="academic.cgpa" label="CGPA" placeholder="e.g., 8.75" error={errors.academic?.cgpa} />
                <FormField name="academic.major" label="Major/Department" placeholder="e.g., Computer Science" error={errors.academic?.major} />
                <FormTextareaField name="academic.academicStrengths" label="Academic Strengths" placeholder="e.g., Data Structures, Algorithms" error={errors.academic?.academicStrengths} />
                <FormTextareaField name="academic.academicWeaknesses" label="Academic Weaknesses" placeholder="e.g., Database Management" error={errors.academic?.academicWeaknesses} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code2 className="text-primary" /> Coding & Technical Profile</CardTitle>
                <CardDescription>Detail your coding skills and projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField name="coding.githubUsername" label="GitHub Username (Optional)" placeholder="your-github-username" />
                <FormField name="coding.codingPlatformUsername" label="Coding Platform Username (Optional)" placeholder="e.g., LeetCode username" />
                <FormField name="coding.programmingLanguages" label="Programming Languages" placeholder="e.g., Python, Java, JavaScript" error={errors.coding?.programmingLanguages}/>
                <FormTextareaField name="coding.keyProjects" label="Key Projects" placeholder="Describe 1-2 significant projects" error={errors.coding?.keyProjects}/>
                <FormTextareaField name="coding.codingPlatformStats" label="Coding Platform Stats (Optional)" placeholder="e.g., LeetCode: 150 solved, Top 10% in contests" />
              </CardContent>
            </Card>
          </div>

          {/* Input Forms & Action Column */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="text-primary" /> Extracurricular Activities</CardTitle>
                <CardDescription>List your non-academic achievements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormTextareaField name="extracurricular.certifications" label="Certifications (Optional)" placeholder="e.g., AWS Certified Cloud Practitioner, Google Data Analytics" />
                <FormTextareaField name="extracurricular.eventsParticipated" label="Events & Workshops (Optional)" placeholder="e.g., Attended AI/ML conference, Web Dev workshop" />
                <FormTextareaField name="extracurricular.hackathonExperience" label="Hackathon Experience (Optional)" placeholder="e.g., Won 1st place in Smart City Hackathon" />
                <FormTextareaField name="extracurricular.leadershipRoles" label="Leadership Roles (Optional)" placeholder="e.g., President of Coding Club, Event Organizer" />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary" /> Skills</CardTitle>
                <CardDescription>List your technical and soft skills, comma-separated.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormTextareaField name="skills" label="Your Skills" placeholder="e.g., Python, React, Problem Solving, Teamwork, SQL" error={errors.skills} />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto flex-grow text-base py-6">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Generate AI Insights
              </Button>
              <Button type="button" variant="outline" onClick={() => reset(defaultProfileValues)} disabled={isLoading} className="w-full sm:w-auto text-base py-6">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {(recommendations || pathways || isLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gauge className="text-accent" /> Employability Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-6xl font-bold text-primary">78/100</p>
                  <p className="text-muted-foreground mt-2">(Mock Score - Based on Your Inputs)</p>
                  <p className="mt-4 text-lg">This is a placeholder score. Real scoring logic will be implemented later.</p>
                </div>
              </CardContent>
            </Card>

          {isLoading && !recommendations && !pathways && (
            <>
              <Card className="shadow-lg animate-pulse">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> AI Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-2"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
              </Card>
              <Card className="shadow-lg animate-pulse col-span-1 md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Waypoints className="text-accent" /> Career Pathway Suggestions</CardTitle></CardHeader>
                <CardContent className="space-y-2"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
              </Card>
            </>
          )}

          {recommendations && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Personalized Actions:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {recommendations.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
                <h3 className="font-semibold text-lg mt-4 mb-2">Suggested Roles to Explore:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.suggestedRoles.map((role, index) => (
                    <span key={index} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground">{role}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pathways && (
            <Card className="shadow-lg col-span-1 md:col-span-2"> {/* Spans 2 columns on medium screens if recommendations are also shown */}
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Waypoints className="text-accent" /> Career Pathway Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Potential Job Roles:</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                   {pathways.suggestedRoles.map((role, index) => (
                    <span key={index} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground">{role}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-lg mb-2">Suggested Pathways & Resources:</h3>
                 <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {pathways.suggestedPathways.map((path, index) => (
                    <li key={index}>{path}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  // Helper component for form fields
  interface FormFieldProps {
    name: keyof ProfileFormData | `academic.${keyof ProfileFormData['academic']}` | `coding.${keyof ProfileFormData['coding']}` | `extracurricular.${keyof ProfileFormData['extracurricular']}`;
    label: string;
    placeholder?: string;
    error?: any; // react-hook-form error type
  }
  
  function FormField({ name, label, placeholder, error }: FormFieldProps) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name} className={error ? 'text-destructive' : ''}>{label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Input id={name} placeholder={placeholder} {...field} className={error ? 'border-destructive' : ''} />}
        />
        {error && <p className="text-xs text-destructive">{error.message}</p>}
      </div>
    );
  }

  interface FormTextareaFieldProps extends FormFieldProps {}

  function FormTextareaField({ name, label, placeholder, error }: FormTextareaFieldProps) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name} className={error ? 'text-destructive' : ''}>{label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Textarea id={name} placeholder={placeholder} {...field} className={`min-h-[80px] ${error ? 'border-destructive' : ''}`} />}
        />
        {error && <p className="text-xs text-destructive">{error.message}</p>}
      </div>
    );
  }
}
