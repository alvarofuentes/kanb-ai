'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/features/voice-recorder';
import { KanbanBoard } from '@/components/features/kanban-board';
import { ProductivityDashboard } from '@/components/features/productivity-dashboard';
import { AddTaskDialog } from '@/components/features/add-task-dialog';
import { AuthDialog } from '@/components/features/auth-dialog';
import { UserMenu } from '@/components/features/user-menu';
import { LanguageSelector } from '@/components/features/language-selector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Mic,
  Kanban,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Loader2,
  LogIn,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');
  const { fetchTasks, fetchStats, isLoading, clearAllTasks } = useTaskStore();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [taskCreated, setTaskCreated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks(user.id);
      fetchStats(user.id);
    }
  }, [fetchTasks, fetchStats, isAuthenticated, user]);

  const handleTasksExtracted = () => {
    setTaskCreated(true);
    setTimeout(() => {
      setTaskCreated(false);
      setActiveTab('kanban');
    }, 1500);
  };

  const handleRefresh = async () => {
    if (user) {
      await Promise.all([fetchTasks(user.id), fetchStats(user.id)]);
    }
  };

  const handleClearBoard = async () => {
    if (user) {
      await clearAllTasks(user.id);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    {t.appName}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {t.appTagline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
                <Button onClick={() => setShowAuthDialog(true)} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <LogIn className="h-4 w-4" />
                  {t.signIn}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {t.manageTasksWithVoice}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {t.landingDescription}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 max-w-4xl">
              <div className="rounded-xl border bg-card p-6 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900 mb-4">
                  <Mic className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.voiceRecording}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.voiceRecordingDesc}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900 mb-4">
                  <Sparkles className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.aiTaskExtraction}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.aiTaskExtractionDesc}
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
                  <Kanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.kanbanBoard}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.kanbanBoardDesc}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setShowAuthDialog(true)}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8 py-6"
            >
              {t.getStarted}
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </main>

        <footer className="border-t bg-background/80 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {t.copyright}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  {t.aiReady}
                </span>
                <span>•</span>
                <span>{t.english} / {t.spanish}</span>
              </div>
            </div>
          </div>
        </footer>

        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {t.appName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t.welcomeBack}, {user?.name?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AddTaskDialog />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw
                  className={cn('h-4 w-4', isLoading && 'animate-spin')}
                />
                {t.refresh}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t.clearBoard || 'Clear Board'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.clearBoardTitle || 'Are you absolutely sure?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.clearBoardDesc || 'This action cannot be undone. This will permanently delete your entire task pipeline from the servers.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel || 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearBoard}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t.continue || 'Continue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <LanguageSelector />
              <ThemeToggle />
              <UserMenu onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {taskCreated && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-lg animate-pulse">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t.taskCreated}! Redirecting to board...
              </span>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-md h-12">
              <TabsTrigger
                value="voice"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">{t.voiceInput}</span>
                <span className="sm:hidden">{t.voice}</span>
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <Kanban className="h-4 w-4" />
                <span className="hidden sm:inline">{t.kanbanBoardNav}</span>
                <span className="sm:hidden">{t.board}</span>
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t.dashboard}</span>
                <span className="sm:hidden">{t.stats}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="voice" className="mt-0">
            <div className="mx-auto max-w-2xl">
              <VoiceRecorder onTasksExtracted={handleTasksExtracted} />
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <ProductivityDashboard />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-background/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {t.copyright}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {t.aiPowered}
              </span>
              <span>•</span>
              <span>{t.english} / {t.spanish}</span>
            </div>
          </div>
        </div>
      </footer>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
