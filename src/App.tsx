import React, { useState, useEffect, useMemo } from 'react';
import { ActiveTab } from './components/Navbar';
import { PowerBiToolbar } from './components/PowerBiToolbar';
import { PowerBiBottomTabs } from './components/PowerBiBottomTabs';
import { PowerBiFiltersPane } from './components/PowerBiFiltersPane';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { CategoryDeepDive } from './components/CategoryDeepDive';
import { PowerQueryStudio } from './components/PowerQueryStudio';
import { DaxMeasuresStudio } from './components/DaxMeasuresStudio';
import { InterviewInsightHub } from './components/InterviewInsightHub';
import { AuthModal } from './components/AuthModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ExportReportModal } from './components/ExportReportModal';
import { DownloadProjectModal } from './components/DownloadProjectModal';
import { 
  getRawDataset 
} from './data/rawDataset';
import { 
  runPowerQueryPipeline, 
  DEFAULT_PIPELINE_CONFIG 
} from './utils/powerQueryEngine';
import { 
  applyFilters, 
  calculateDaxMeasures, 
  getMonthlyTrends, 
  getCategorySummaries, 
  getRegionSummaries, 
  INITIAL_FILTERS 
} from './utils/daxEngine';
import { 
  auth, 
  signOut, 
  onAuthStateChanged, 
  syncUserProfile, 
  testConnection, 
  recordAuditLog, 
  UserProfile 
} from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(true);
  const [isFiltersPaneOpen, setIsFiltersPaneOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pipeline state
  const rawRecords = useMemo(() => getRawDataset(), []);
  const [pipelineConfig, setPipelineConfig] = useState(DEFAULT_PIPELINE_CONFIG);

  // Clean records through Power Query
  const { cleaned: cleanedRecords, metrics } = useMemo(() => {
    return runPowerQueryPipeline(rawRecords, pipelineConfig);
  }, [rawRecords, pipelineConfig]);

  // Interactive Slicer & Filter State
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return applyFilters(cleanedRecords, filters);
  }, [cleanedRecords, filters]);

  // Evaluated DAX Measures
  const daxMeasures = useMemo(() => {
    return calculateDaxMeasures(filteredRecords, cleanedRecords);
  }, [filteredRecords, cleanedRecords]);

  // Visual Aggregations
  const monthlyTrends = useMemo(() => {
    return getMonthlyTrends(filteredRecords);
  }, [filteredRecords]);

  const categorySummaries = useMemo(() => {
    return getCategorySummaries(filteredRecords);
  }, [filteredRecords]);

  const regionSummaries = useMemo(() => {
    return getRegionSummaries(filteredRecords);
  }, [filteredRecords]);

  // Boot connection check to Firestore & Auth listener
  useEffect(() => {
    testConnection();

    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    await recordAuditLog('AUTH_SIGN_OUT', 'User signed out');
    await signOut(auth);
    setUserProfile(null);
  };

  const handlePipelineApplied = async () => {
    await recordAuditLog(
      'POWER_QUERY_PIPELINE_RUN',
      `Pipeline executed: ${metrics.duplicatesRemoved} duplicates removed, ${metrics.negativePricesFixed} negative prices fixed, ${metrics.outliersCapped} outliers capped.`
    );
  };

  const handleSelectCategory = (cat: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: [cat],
    }));
    setActiveTab('deepdive');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters =
    filters.selectedRegions.length > 0 ||
    (filters.selectedCities && filters.selectedCities.length > 0) ||
    filters.selectedCategories.length > 0 ||
    filters.selectedStatuses.length > 0 ||
    filters.selectedMonth !== 'all' ||
    filters.onlyUnderperforming ||
    filters.searchQuery !== '';

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Power BI Desktop Toolbar */}
      <PowerBiToolbar
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExportPdf={() => setIsExportModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        isFiltersPaneOpen={isFiltersPaneOpen}
        onToggleFiltersPane={() => setIsFiltersPaneOpen(!isFiltersPaneOpen)}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        dataQualityScore={metrics.dataQualityScore}
      />

      {/* Main Power BI Report Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/70">
          <div className="max-w-7xl mx-auto space-y-4">
            {activeTab === 'overview' && (
              <ExecutiveOverview
                records={filteredRecords}
                allRecords={cleanedRecords}
                daxMeasures={daxMeasures}
                filters={filters}
                setFilters={setFilters}
                monthlyTrends={monthlyTrends}
                categorySummaries={categorySummaries}
                regionSummaries={regionSummaries}
                onNavigateToDeepDive={() => setActiveTab('deepdive')}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {activeTab === 'deepdive' && (
              <CategoryDeepDive
                records={filteredRecords}
                categorySummaries={categorySummaries}
                filters={filters}
                setFilters={setFilters}
              />
            )}

            {activeTab === 'powerquery' && (
              <PowerQueryStudio
                rawRecords={rawRecords}
                cleanedRecords={cleanedRecords}
                pipelineConfig={pipelineConfig}
                setPipelineConfig={setPipelineConfig}
                metrics={metrics}
                onApplyPipeline={handlePipelineApplied}
              />
            )}

            {activeTab === 'dax' && (
              <DaxMeasuresStudio
                records={filteredRecords}
                daxMeasures={daxMeasures}
              />
            )}

            {activeTab === 'interview' && (
              <InterviewInsightHub
                categorySummaries={categorySummaries}
                daxMeasures={daxMeasures}
              />
            )}
          </div>
        </main>

        {/* Collapsible Power BI Right Filters Pane */}
        <PowerBiFiltersPane
          isOpen={isFiltersPaneOpen}
          onToggle={() => setIsFiltersPaneOpen(!isFiltersPaneOpen)}
          filters={filters}
          setFilters={setFilters}
          totalRecordsCount={cleanedRecords.length}
          filteredRecordsCount={filteredRecords.length}
        />
      </div>

      {/* Power BI Desktop Bottom Page Tabs */}
      <PowerBiBottomTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredCount={filteredRecords.length}
      />

      {/* Functional Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={profile => setUserProfile(profile)}
      />

      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        daxMeasures={daxMeasures}
        categorySummaries={categorySummaries}
        metrics={metrics}
      />

      <DownloadProjectModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        rawRecords={rawRecords}
        cleanedRecords={cleanedRecords}
        daxMeasures={daxMeasures}
        categorySummaries={categorySummaries}
        metrics={metrics}
      />
    </div>
  );
}
