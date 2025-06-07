
"use client";

import React, { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
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
  Linkedin,
  Github,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Package,
  ChevronRight,
  BookOpenCheck,
} from 'lucide-react';
import type {
  ProfileFormData,
  CareerRecommendation,
  CareerPathway,
  EmployabilityScore,
  GitHubAnalyticsData,
  LeetCodeAnalyticsData,
  CommitHistoryData,
  LeetCodeDifficultyData,
  LeetCodeDailyActivityData,
} from '@/lib/types';
import { generateCareerRecommendations } from '@/ai/flows/generate-career-recommendations';
import { suggestCareerPathways } from '@/ai/flows/suggest-career-pathways';
import { calculateEmployabilityScore } from '@/ai/flows/calculate-employability-score';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';


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
  linkedinProfile: z.string().url("Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)").optional().or(z.literal("")),
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
  linkedinProfile: "",
};

// Simulated data fetching functions
const simulateGitHubFetch = async (username: string): Promise<GitHubAnalyticsData> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (!username) return { commitHistory: [], repoCount: 0 };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const commitHistory: CommitHistoryData[] = months.map(month => ({
    month,
    commits: Math.floor(Math.random() * 50) + 5,
  }));
  return {
    commitHistory,
    repoCount: Math.floor(Math.random() * 20) + 1,
  };
};

const simulateLeetCodeFetch = async (username: string): Promise<LeetCodeAnalyticsData> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (!username) return { totalSolved: 0, solvedByDifficulty: [], dailyActivity: [] };
  const totalSolved = Math.floor(Math.random() * 500) + 50;
  const easySolved = Math.floor(totalSolved * (Math.random() * 0.4 + 0.3));
  const mediumSolved = Math.floor(totalSolved * (Math.random() * 0.3 + 0.2));
  const hardSolved = totalSolved - easySolved - mediumSolved > 0 ? totalSolved - easySolved - mediumSolved : 0;

  const solvedByDifficulty: LeetCodeDifficultyData[] = [
    { level: 'Easy', solved: easySolved },
    { level: 'Medium', solved: mediumSolved },
    { level: 'Hard', solved: hardSolved },
  ];

  const dailyActivity: LeetCodeDailyActivityData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dailyActivity.push({
      date: date.toISOString().split('T')[0],
      solved: Math.floor(Math.random() * 5),
    });
  }

  return {
    totalSolved,
    solvedByDifficulty,
    dailyActivity,
  };
};

const getScoreColorAndLabel = (score: number): { colorClass: string; progressBarClass: string; label: string } => {
  if (score < 20) return { colorClass: 'text-red-500', progressBarClass: 'bg-red-500', label: 'Critically Low' };
  if (score <= 50) return { colorClass: 'text-yellow-500', progressBarClass: 'bg-yellow-500', label: 'Developing' };
  if (score <= 80) return { colorClass: 'text-blue-500', progressBarClass: 'bg-blue-500', label: 'Good' };
  return { colorClass: 'text-green-500', progressBarClass: 'bg-green-500', label: 'Excellent' };
};


export default function CareerPredictorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation | null>(null);
  const [pathways, setPathways] = useState<CareerPathway | null>(null);
  const [employabilityScore, setEmployabilityScore] = useState<EmployabilityScore | null>(null);
  const [gitHubData, setGitHubData] = useState<GitHubAnalyticsData | null>(null);
  const [leetCodeData, setLeetCodeData] = useState<LeetCodeAnalyticsData | null>(null);
  const [githubUsernameForAnalytics, setGithubUsernameForAnalytics] = useState<string | null>(null);
  const [leetcodeUsernameForAnalytics, setLeetcodeUsernameForAnalytics] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);


  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/signin');
    } else {
      setIsAuthenticating(false);
    }
  }, [router]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues,
  });

  const { control, handleSubmit, reset, formState: { errors } } = form;

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setIsLoadingAnalytics(true);
    setRecommendations(null);
    setPathways(null);
    setEmployabilityScore(null);
    setGitHubData(null);
    setLeetCodeData(null);
    setGithubUsernameForAnalytics(data.coding.githubUsername || null);
    setLeetcodeUsernameForAnalytics(data.coding.codingPlatformUsername || null);

    const academicPerformanceSummary = `CGPA: ${data.academic.cgpa}, Major: ${data.academic.major}. Strengths: ${data.academic.academicStrengths}. Weaknesses: ${data.academic.academicWeaknesses}.`;
    const codingSkillsSummary = `Languages & Frameworks: ${data.coding.programmingLanguages}. Notable Projects: ${data.coding.keyProjects}. GitHub: ${data.coding.githubUsername || 'N/A'}. Coding Platform (${data.coding.codingPlatformUsername || 'N/A'}): ${data.coding.codingPlatformStats || 'N/A'}.`;
    const extracurricularActivitiesSummary = `Certifications: ${data.extracurricular.certifications || 'N/A'}. Events: ${data.extracurricular.eventsParticipated || 'N/A'}. Hackathons: ${data.extracurricular.hackathonExperience || 'N/A'}. Leadership: ${data.extracurricular.leadershipRoles || 'N/A'}.`;

    const technicalAndProgrammingSkillsSummary = `Programming Languages: ${data.coding.programmingLanguages}. Key Projects: ${data.coding.keyProjects}. General Skills: ${data.skills}.`;
    const professionalNetworkingSummary = `LinkedIn Profile: ${data.linkedinProfile || 'N/A'}.`;
    const problemSolvingSkillsSummary = `GitHub: ${data.coding.githubUsername || 'N/A'} (Activity/Repositories should be inferred from description if available). Coding Platform (${data.coding.codingPlatformUsername || 'N/A'}): ${data.coding.codingPlatformStats || 'N/A'}.`;

    try {
      const [recs, paths, scoreOutput] = await Promise.all([
        generateCareerRecommendations({
          academicPerformance: academicPerformanceSummary,
          codingSkills: codingSkillsSummary,
          extracurricularActivities: extracurricularActivitiesSummary,
        }),
        suggestCareerPathways({
          academicPerformance: academicPerformanceSummary,
          codingStats: problemSolvingSkillsSummary,
          extracurricularActivities: extracurricularActivitiesSummary,
          skills: data.skills,
        }),
        calculateEmployabilityScore({
          academicPerformance: academicPerformanceSummary,
          technicalAndProgrammingSkills: technicalAndProgrammingSkillsSummary,
          professionalNetworking: professionalNetworkingSummary,
          problemSolvingSkills: problemSolvingSkillsSummary,
          extracurricularActivities: extracurricularActivitiesSummary,
        }),
      ]);

      setRecommendations(recs);
      setPathways(paths);
      setEmployabilityScore(scoreOutput);
      setIsLoading(false);

      toast({
        title: "AI Insights Generated!",
        description: "Your personalized recommendations, career pathways, and employability score are ready.",
      });

      const analyticsPromises = [];
      if (data.coding.githubUsername) {
        analyticsPromises.push(simulateGitHubFetch(data.coding.githubUsername).then(setGitHubData));
      }
      if (data.coding.codingPlatformUsername) {
        analyticsPromises.push(simulateLeetCodeFetch(data.coding.codingPlatformUsername).then(setLeetCodeData));
      }
      await Promise.all(analyticsPromises);

    } catch (error: any) {
      console.error("🔴 Full error object during insights/analytics generation:", error);
      let description = "An error occurred while processing your request. Please try again. Check server logs for details.";
      if (error instanceof Error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        description = `Failed: ${error.message}. Check server logs for more details.`;
      } else if (typeof error === 'string') {
        description = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        description = `Failed: ${String(error.message)}. Check server logs for more details.`;
      }

      toast({
        variant: "destructive",
        title: "Error Generating Insights or Analytics",
        description: description,
      });
      setIsLoading(false);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const gitHubCommitChartConfig = {
    commits: { label: "Commits", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const leetCodeDifficultyChartConfig = {
    easy: { label: "Easy", color: "hsl(var(--chart-2))" },
    medium: { label: "Medium", color: "hsl(var(--chart-3))" },
    hard: { label: "Hard", color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig;

  const leetCodeActivityChartConfig = {
    solved: { label: "Problems Solved", color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.32))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const scoreStyling = employabilityScore ? getScoreColorAndLabel(employabilityScore.score) : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
       <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/student')} className="text-sm">
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" /> Back to Student Dashboard
        </Button>
      </div>
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Career Predictor & AI Insights</h2>
        <p className="text-muted-foreground">
          Fill in your details to get AI-powered insights and career suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary" /> Academic Performance</CardTitle>
                <CardDescription>Enter your academic details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField name="academic.cgpa" label="CGPA" placeholder="e.g., 8.75" error={errors.academic?.cgpa} control={control} />
                <FormField name="academic.major" label="Major/Department" placeholder="e.g., Computer Science" error={errors.academic?.major} control={control} />
                <FormTextareaField name="academic.academicStrengths" label="Academic Strengths" placeholder="e.g., Data Structures, Algorithms" error={errors.academic?.academicStrengths} control={control} />
                <FormTextareaField name="academic.academicWeaknesses" label="Academic Weaknesses" placeholder="e.g., Database Management" error={errors.academic?.academicWeaknesses} control={control} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Code2 className="text-primary" /> Coding & Technical Profile</CardTitle>
                <CardDescription>Detail your coding skills, projects, and online presence.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField name="coding.githubUsername" label="GitHub Username (Optional)" placeholder="your-github-username" icon={<Github className="text-primary h-4 w-4" />} control={control} />
                <FormField name="coding.codingPlatformUsername" label="Coding Platform Username (Optional)" placeholder="e.g., LeetCode username" icon={<Activity className="text-primary h-4 w-4" />} control={control} />
                <FormField name="linkedinProfile" label="LinkedIn Profile URL (Optional)" placeholder="https://linkedin.com/in/yourprofile" error={errors.linkedinProfile} icon={<Linkedin className="text-primary h-4 w-4" />} control={control}/>
                <FormField name="coding.programmingLanguages" label="Programming Languages" placeholder="e.g., Python, Java, JavaScript" error={errors.coding?.programmingLanguages} control={control}/>
                <FormTextareaField name="coding.keyProjects" label="Key Projects" placeholder="Describe 1-2 significant projects" error={errors.coding?.keyProjects} control={control}/>
                <FormTextareaField name="coding.codingPlatformStats" label="Coding Platform Stats (Optional)" placeholder="e.g., LeetCode: 150 solved, Top 10% in contests" control={control} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="text-primary" /> Extracurricular Activities</CardTitle>
                <CardDescription>List your non-academic achievements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormTextareaField name="extracurricular.certifications" label="Certifications (Optional)" placeholder="e.g., AWS Certified Cloud Practitioner, Google Data Analytics" control={control} />
                <FormTextareaField name="extracurricular.eventsParticipated" label="Events & Workshops (Optional)" placeholder="e.g., Attended AI/ML conference, Web Dev workshop" control={control} />
                <FormTextareaField name="extracurricular.hackathonExperience" label="Hackathon Experience (Optional)" placeholder="e.g., Won 1st place in Smart City Hackathon" control={control} />
                <FormTextareaField name="extracurricular.leadershipRoles" label="Leadership Roles (Optional)" placeholder="e.g., President of Coding Club, Event Organizer" control={control} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary" /> Skills</CardTitle>
                <CardDescription>List your technical and soft skills, comma-separated.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormTextareaField name="skills" label="Your Skills" placeholder="e.g., Python, React, Problem Solving, Teamwork, SQL" error={errors.skills} control={control} />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={isLoading || isLoadingAnalytics} className="w-full sm:w-auto flex-grow text-base py-6">
                {(isLoading || isLoadingAnalytics) ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                Generate AI Insights & Analytics
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                reset(defaultProfileValues);
                setRecommendations(null);
                setPathways(null);
                setEmployabilityScore(null);
                setGitHubData(null);
                setLeetCodeData(null);
                setGithubUsernameForAnalytics(null);
                setLeetcodeUsernameForAnalytics(null);
                }} disabled={isLoading || isLoadingAnalytics} className="w-full sm:w-auto text-base py-6">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </form>

      {(isLoading || isLoadingAnalytics || employabilityScore || recommendations || pathways || gitHubData || leetCodeData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {isLoading && !employabilityScore && (
            <Card className="shadow-lg animate-pulse">
              <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="text-accent" /> Employability Score</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-center py-8">
                <div className="h-10 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-6 bg-muted rounded w-3/4 mx-auto mt-2"></div>
                <div className="h-4 bg-muted rounded w-full mx-auto mt-4"></div>
              </CardContent>
            </Card>
          )}
          {employabilityScore && scoreStyling && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gauge className={cn("text-primary", scoreStyling.colorClass)} /> Employability Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 space-y-4">
                <div>
                  <p className={cn("text-6xl font-bold", scoreStyling.colorClass)}>{employabilityScore.score}/100</p>
                  <p className={cn("text-lg font-semibold mt-1", scoreStyling.colorClass)}>{scoreStyling.label}</p>
                </div>
                <Progress value={employabilityScore.score} className="w-full h-3 [&>div]:transition-all [&>div]:duration-500" indicatorClassName={scoreStyling.progressBarClass} />
                <p className="mt-4 text-muted-foreground text-sm text-left whitespace-pre-line">
                  {employabilityScore.feedback || "This score is dynamically calculated by AI based on your profile."}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && !recommendations && (
            <Card className="shadow-lg animate-pulse">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> AI Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
            </Card>
          )}
          {recommendations && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Personalized Actions & Learning:</h3>
                {recommendations.recommendations.map((recItem, index) => (
                  <div key={index} className="mb-4 pb-3 border-b last:border-b-0 last:pb-0 last:mb-0">
                    <p className="text-sm text-foreground mb-1.5">{recItem.action}</p>
                    {recItem.suggestedLearningResources && recItem.suggestedLearningResources.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
                          Suggested Learning:
                        </p>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {recItem.suggestedLearningResources.map((resource, rIndex) => (
                            <li key={rIndex} className="text-xs text-muted-foreground/90">{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                <h3 className="font-semibold text-lg mt-6 mb-2">Suggested Roles to Explore:</h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.suggestedRoles.map((role, index) => (
                    <span key={index} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground">{role}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && !pathways && (
             <Card className="shadow-lg animate-pulse col-span-1 md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><Waypoints className="text-accent" /> Career Pathway Suggestions</CardTitle></CardHeader>
                <CardContent className="space-y-2"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
              </Card>
          )}
          {pathways && (
             <Card className={`shadow-lg ${employabilityScore && recommendations ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
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

          {githubUsernameForAnalytics && (
            isLoadingAnalytics && !gitHubData ? (
              <Card className="shadow-lg animate-pulse">
                <CardHeader><CardTitle className="flex items-center gap-2"><Github className="text-accent" /> GitHub Analytics for {githubUsernameForAnalytics}</CardTitle></CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent>
              </Card>
            ) : gitHubData && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Github className="text-accent" /> GitHub Analytics for {githubUsernameForAnalytics}</CardTitle>
                  <CardDescription>Simulated commit history and repository count.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Package className="text-primary h-6 w-6" />
                    <p className="text-2xl font-semibold">{gitHubData.repoCount} <span className="text-sm text-muted-foreground">Repositories</span></p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><BarChart3 className="text-primary h-5 w-5" />Commit History (Last 6 Months)</h4>
                    <ChartContainer config={gitHubCommitChartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart accessibilityLayer data={gitHubData.commitHistory} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="commits" fill="var(--color-commits)" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {leetcodeUsernameForAnalytics && (
            isLoadingAnalytics && !leetCodeData ? (
              <Card className="shadow-lg animate-pulse">
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="text-accent" /> Coding Platform Analytics for {leetcodeUsernameForAnalytics}</CardTitle></CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent>
              </Card>
            ) : leetCodeData && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="text-accent" /> Coding Platform Analytics for {leetcodeUsernameForAnalytics}</CardTitle>
                  <CardDescription>Simulated problem solving statistics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <p className="text-2xl font-semibold">{leetCodeData.totalSolved} <span className="text-sm text-muted-foreground">Total Problems Solved</span></p>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><BarChart3 className="text-primary h-5 w-5" />Solved by Difficulty</h4>
                    <ChartContainer config={leetCodeDifficultyChartConfig} className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height={250}>
                        <BarChart accessibilityLayer data={leetCodeData.solvedByDifficulty} layout="vertical" margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} />
                          <YAxis dataKey="level" type="category" tickLine={false} axisLine={false} width={60} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="solved" radius={4}>
                            {leetCodeData.solvedByDifficulty.map((entry, index) => (
                               <div key={`cell-${index}`} style={{ backgroundColor: entry.level === 'Easy' ? 'hsl(var(--chart-2))' : entry.level === 'Medium' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))' }} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2"><LineChartIcon className="text-primary h-5 w-5" />Daily Activity (Last 7 Days)</h4>
                    <ChartContainer config={leetCodeActivityChartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart accessibilityLayer data={leetCodeData.dailyActivity} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line type="monotone" dataKey="solved" stroke="var(--color-solved)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-solved)" }} activeDot={{ r: 6 }}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}

interface FormFieldProps {
  name: keyof ProfileFormData | `academic.${keyof ProfileFormData['academic']}` | `coding.${keyof ProfileFormData['coding']}` | `extracurricular.${keyof ProfileFormData['extracurricular']}` | 'linkedinProfile';
  label: string;
  placeholder?: string;
  error?: any;
  icon?: React.ReactNode;
  control: any; // react-hook-form control prop
}

function FormField({ name, label, placeholder, error, icon, control }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={cn('flex items-center gap-2', error ? 'text-destructive' : '')}>
        {icon}
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => <Input id={name} placeholder={placeholder} {...field} className={error ? 'border-destructive' : ''} />}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

interface FormTextareaFieldProps extends Omit<FormFieldProps, 'icon'> {}

function FormTextareaField({ name, label, placeholder, error, control }: FormTextareaFieldProps) {
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

// Extend ProgressProps to accept indicatorClassName
interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof Progress> {
  indicatorClassName?: string;
}

// Custom Progress component or modify the existing one if you have direct access
// For this example, we assume Progress component can take indicatorClassName
// If not, you would need to create a wrapper or use a different approach
const CustomProgress = React.forwardRef<
  React.ElementRef<typeof Progress>,
  CustomProgressProps
>(({ value, className, indicatorClassName, ...props }, ref) => {
  return (
    <Progress ref={ref} value={value} className={className} {...props}>
      {/* This is a conceptual way to style the indicator if Progress was built this way */}
      {/* Actual ShadCN Progress styling is internal. We achieve this by passing indicatorClassName to Progress */}
      {/* <Progress.Indicator className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} style={{ transform: `translateX(-${100 - (value || 0)}%)` }} /> */}
    </Progress>
  );
});
CustomProgress.displayName = "CustomProgress";

