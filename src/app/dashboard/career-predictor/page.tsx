
"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
  BookMarked, 
  Youtube, 
  Link as LinkIcon,
  Save, // Added Save icon
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
  LearningResource, 
  ResourceType, 
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
import Link from 'next/link';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions

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

const ResourceIcon = ({ type }: { type: ResourceType }) => {
  const iconSize = "h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary";
  switch (type) {
    case 'course':
      return <BookOpenCheck className={iconSize} />;
    case 'book/pdf':
      return <BookMarked className={iconSize} />;
    case 'youtube_video/channel':
      return <Youtube className={iconSize} />;
    default:
      return <LinkIcon className={iconSize} />;
  }
};


export default function CareerPredictorPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation | null>(null);
  const [pathways, setPathways] = useState<CareerPathway | null>(null);
  const [employabilityScore, setEmployabilityScore] = useState<EmployabilityScore | null>(null);
  const [gitHubData, setGitHubData] = useState<GitHubAnalyticsData | null>(null);
  const [leetCodeData, setLeetCodeData] = useState<LeetCodeAnalyticsData | null>(null);
  const [githubUsernameForAnalytics, setGithubUsernameForAnalytics] = useState<string | null>(null);
  const [leetcodeUsernameForAnalytics, setLeetcodeUsernameForAnalytics] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultProfileValues,
  });

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = form;

  const fetchProfileData = useCallback(async (user: User) => {
    if (!user) return;
    const profileDocRef = doc(db, 'profiles', user.uid);
    try {
      const docSnap = await getDoc(profileDocRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data() as ProfileFormData;
        reset(profileData); // Pre-fill form
        toast({ title: "Profile Loaded", description: "Your saved profile data has been loaded."});
      } else {
        reset(defaultProfileValues); // Reset to default if no profile saved
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({ variant: "destructive", title: "Error Loading Profile", description: "Could not load your saved profile."});
      reset(defaultProfileValues);
    }
  }, [reset, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchProfileData(user); // Fetch profile data once user is confirmed
        setIsAuthenticating(false);
      } else {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router, fetchProfileData]);

  const saveProfile = async (data: ProfileFormData) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be signed in to save your profile."});
      return;
    }
    setIsSavingProfile(true);
    const profileDocRef = doc(db, 'profiles', currentUser.uid);
    try {
      await setDoc(profileDocRef, { ...data, lastUpdated: serverTimestamp() }, { merge: true });
      toast({ title: "Profile Saved!", description: "Your profile data has been saved successfully."});
      form.reset(data, { keepValues: true, keepDirty: false }); // Reset dirty state
    } catch (error: any) {
      console.error("Error saving profile data:", error);
      toast({ variant: "destructive", title: "Error Saving Profile", description: error.message || "Could not save your profile."});
    } finally {
      setIsSavingProfile(false);
    }
  };


  const onGenerateInsights = async (data: ProfileFormData) => {
    setIsLoading(true);
    setIsLoadingAnalytics(true);
    setRecommendations(null);
    setPathways(null);
    setEmployabilityScore(null);
    setGitHubData(null);
    setLeetCodeData(null);
    setGithubUsernameForAnalytics(data.coding.githubUsername || null);
    setLeetcodeUsernameForAnalytics(data.coding.codingPlatformUsername || null);

    // Save profile before generating insights if it's dirty
    if (isDirty) {
      await saveProfile(data);
    }


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
      console.error("🔴 Full error object during insights/analytics generation (CLIENT-SIDE CATCH):");
      console.error("Error Name:", error?.name);
      console.error("Error Message:", error?.message);
      console.error("Error Stack:", error?.stack);
      console.error("Full Error Object (Client):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      let description = "An error occurred while processing your request. Please try again. Check server logs for details.";
      if (error instanceof Error) {
        description = `Failed: ${error.message}. IMPORTANT: Check server console (terminal running 'npm run dev') for more detailed logs and potential causes like API key issues or AI model errors.`;
      } else if (typeof error === 'string') {
        description = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        description = `Failed: ${String(error.message)}. IMPORTANT: Check server console (terminal running 'npm run dev') for more detailed logs.`;
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
       <div className="mb-4 sm:mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard/student')} className="text-xs sm:text-sm">
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" /> Back to Student Dashboard
        </Button>
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Career Predictor & AI Insights</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill in your details to get AI-powered insights and career suggestions. Your profile will be saved.
        </p>
      </div>

      <form onSubmit={handleSubmit(onGenerateInsights)} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6 sm:space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><GraduationCap className="text-primary h-5 w-5 sm:h-6 sm:w-6" /> Academic Performance</CardTitle>
                <CardDescription className="text-sm">Enter your academic details.</CardDescription>
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
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Code2 className="text-primary h-5 w-5 sm:h-6 sm:w-6" /> Coding & Technical Profile</CardTitle>
                <CardDescription className="text-sm">Detail your coding skills, projects, and online presence.</CardDescription>
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

          <div className="space-y-6 sm:space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Award className="text-primary h-5 w-5 sm:h-6 sm:w-6" /> Extracurricular Activities</CardTitle>
                <CardDescription className="text-sm">List your non-academic achievements.</CardDescription>
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
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><ClipboardList className="text-primary h-5 w-5 sm:h-6 sm:w-6" /> Skills</CardTitle>
                <CardDescription className="text-sm">List your technical and soft skills, comma-separated.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormTextareaField name="skills" label="Your Skills" placeholder="e.g., Python, React, Problem Solving, Teamwork, SQL" error={errors.skills} control={control} />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:gap-4">
              <Button 
                type="button" 
                onClick={handleSubmit(saveProfile)} 
                disabled={isSavingProfile || !isDirty} 
                variant="outline"
                className="w-full text-sm sm:text-base py-3 sm:py-4 md:py-6"
              >
                {isSavingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                )}
                Save Profile Data
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingAnalytics || isSavingProfile} className="w-full text-sm sm:text-base py-3 sm:py-4 md:py-6">
                {(isLoading || isLoadingAnalytics) ? (
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                }} disabled={isLoading || isLoadingAnalytics || isSavingProfile} className="w-full text-sm sm:text-base py-3 sm:py-4 md:py-6">
                <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      </form>

      {(isLoading || isLoadingAnalytics || employabilityScore || recommendations || pathways || gitHubData || leetCodeData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-10 sm:mt-12">
          {isLoading && !employabilityScore && (
            <Card className="shadow-lg animate-pulse">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Gauge className="text-accent h-5 w-5 sm:h-6 sm:w-6" /> Employability Score</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-center py-6 sm:py-8">
                <div className="h-8 sm:h-10 bg-muted rounded w-1/2 mx-auto"></div>
                <div className="h-5 sm:h-6 bg-muted rounded w-3/4 mx-auto mt-2"></div>
                <div className="h-4 bg-muted rounded w-full mx-auto mt-4"></div>
              </CardContent>
            </Card>
          )}
          {employabilityScore && scoreStyling && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Gauge className={cn("text-primary h-5 w-5 sm:h-6 sm:w-6", scoreStyling.colorClass)} /> Employability Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6 sm:py-8 space-y-4">
                <div>
                  <p className={cn("text-5xl sm:text-6xl font-bold", scoreStyling.colorClass)}>{employabilityScore.score}/100</p>
                  <p className={cn("text-base sm:text-lg font-semibold mt-1", scoreStyling.colorClass)}>{scoreStyling.label}</p>
                </div>
                <Progress value={employabilityScore.score} className="w-full h-2.5 sm:h-3 [&>div]:transition-all [&>div]:duration-500" indicatorClassName={scoreStyling.progressBarClass} />
                <p className="mt-4 text-xs sm:text-sm text-muted-foreground text-left whitespace-pre-line">
                  {employabilityScore.feedback || "This score is dynamically calculated by AI based on your profile."}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && !recommendations && (
            <Card className="shadow-lg animate-pulse">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Sparkles className="text-accent h-5 w-5 sm:h-6 sm:w-6" /> AI Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2 p-4 sm:p-6"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
            </Card>
          )}
          {recommendations && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Sparkles className="text-accent h-5 w-5 sm:h-6 sm:w-6" /> AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-3">Personalized Actions & Learning:</h3>
                {recommendations.recommendations.map((recItem, index) => (
                  <div key={index} className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                    <p className="text-sm sm:text-base text-foreground font-medium mb-2">{recItem.action}</p>
                    {recItem.suggestedResources && recItem.suggestedResources.length > 0 && (
                      <div className="mt-1.5 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Suggested Learning Resources:</p>
                        <ul className="space-y-1.5">
                          {recItem.suggestedResources.map((resource, rIndex) => (
                            <li key={rIndex} className="text-xs text-muted-foreground/90 flex items-start gap-2">
                              <ResourceIcon type={resource.type} />
                              <div className="flex-1">
                                {resource.url ? (
                                  <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary font-medium text-foreground">
                                    {resource.title}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-foreground">{resource.title}</span>
                                )}
                                {resource.description && <p className="text-xs text-muted-foreground/80 mt-0.5">{resource.description}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                <h3 className="font-semibold text-base sm:text-lg mt-4 sm:mt-6 mb-2">Suggested Roles to Explore:</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(recommendations.suggestedRoles || []).map((role, index) => (
                    <span key={index} className="px-2.5 py-1 text-xs rounded-full bg-accent text-accent-foreground">{role}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && !pathways && (
             <Card className="shadow-lg animate-pulse col-span-1 md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Waypoints className="text-accent h-5 w-5 sm:h-6 sm:w-6" /> Career Pathway Suggestions</CardTitle></CardHeader>
                <CardContent className="space-y-2 p-4 sm:p-6"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-4 bg-muted rounded w-1/2"></div></CardContent>
              </Card>
          )}
          {pathways && (
             <Card className={`shadow-lg ${employabilityScore && recommendations ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl"><Waypoints className="text-accent h-5 w-5 sm:h-6 sm:w-6" /> Career Pathway Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2">Potential Job Roles:</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                   {pathways.suggestedRoles.map((role, index) => (
                    <span key={index} className="px-2.5 py-1 text-xs rounded-full bg-accent text-accent-foreground">{role}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">Suggested Pathways & Resources:</h3>
                 <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Github className="text-accent h-4 w-4 sm:h-5 sm:w-5" /> GitHub Analytics for {githubUsernameForAnalytics}</CardTitle></CardHeader>
                <CardContent className="h-[250px] sm:h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" /></CardContent>
              </Card>
            ) : gitHubData && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Github className="text-accent h-4 w-4 sm:h-5 sm:w-5" /> GitHub Analytics for {githubUsernameForAnalytics}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Simulated commit history and repository count.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Package className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                    <p className="text-xl sm:text-2xl font-semibold">{gitHubData.repoCount} <span className="text-xs sm:text-sm text-muted-foreground">Repositories</span></p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center gap-2"><BarChart3 className="text-primary h-4 w-4 sm:h-5 sm:w-5" />Commit History (Last 6 Months)</h4>
                    <ChartContainer config={gitHubCommitChartConfig} className="h-[200px] sm:h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart accessibilityLayer data={gitHubData.commitHistory} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize="0.75rem" />
                          <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize="0.75rem" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="commits" fill="var(--color-commits)" radius={3} />
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
                <CardHeader><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Activity className="text-accent h-4 w-4 sm:h-5 sm:w-5" /> Coding Platform Analytics for {leetcodeUsernameForAnalytics}</CardTitle></CardHeader>
                <CardContent className="h-[300px] sm:h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" /></CardContent>
              </Card>
            ) : leetCodeData && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Activity className="text-accent h-4 w-4 sm:h-5 sm:w-5" /> Coding Platform Analytics for {leetcodeUsernameForAnalytics}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Simulated problem solving statistics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                   <p className="text-xl sm:text-2xl font-semibold">{leetCodeData.totalSolved} <span className="text-xs sm:text-sm text-muted-foreground">Total Problems Solved</span></p>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center gap-2"><BarChart3 className="text-primary h-4 w-4 sm:h-5 sm:w-5" />Solved by Difficulty</h4>
                    <ChartContainer config={leetCodeDifficultyChartConfig} className="h-[200px] sm:h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                        <BarChart accessibilityLayer data={leetCodeData.solvedByDifficulty} layout="vertical" margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} fontSize="0.75rem" />
                          <YAxis dataKey="level" type="category" tickLine={false} axisLine={false} width={50} fontSize="0.75rem" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="solved" radius={3}>
                            {leetCodeData.solvedByDifficulty.map((entry, index) => (
                               <div key={`cell-${index}`} style={{ backgroundColor: entry.level === 'Easy' ? 'hsl(var(--chart-2))' : entry.level === 'Medium' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))' }} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center gap-2"><LineChartIcon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />Daily Activity (Last 7 Days)</h4>
                    <ChartContainer config={leetCodeActivityChartConfig} className="h-[200px] sm:h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart accessibilityLayer data={leetCodeData.dailyActivity} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} tickLine={false} axisLine={false} tickMargin={10} fontSize="0.75rem" />
                          <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize="0.75rem" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line type="monotone" dataKey="solved" stroke="var(--color-solved)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-solved)" }} activeDot={{ r: 5 }}/>
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
  control: any; 
}

function FormField({ name, label, placeholder, error, icon, control }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={cn('flex items-center gap-2 text-sm', error ? 'text-destructive' : '')}>
        {icon}
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => <Input id={name} placeholder={placeholder} {...field} className={cn("text-base sm:text-sm", error ? 'border-destructive' : '')} />}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

interface FormTextareaFieldProps extends Omit<FormFieldProps, 'icon'> {}

function FormTextareaField({ name, label, placeholder, error, control }: FormTextareaFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={cn("text-sm", error ? 'text-destructive' : '')}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => <Textarea id={name} placeholder={placeholder} {...field} className={cn("min-h-[70px] sm:min-h-[80px] text-base sm:text-sm", error ? 'border-destructive' : '')} />}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof Progress> {
  indicatorClassName?: string;
}

const CustomProgress = React.forwardRef<
  React.ElementRef<typeof Progress>,
  CustomProgressProps
>(({ value, className, indicatorClassName, ...props }, ref) => {
  return (
    <Progress ref={ref} value={value} className={className} {...props}>
    </Progress>
  );
});
CustomProgress.displayName = "CustomProgress";
