import React, { useState, useEffect } from 'react';
import { Student, Topic, Writing, RewardEvent, WritingStatus } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { StudentSelectModal } from './components/StudentSelectModal';
import { StudentDashboard } from './components/StudentView/StudentDashboard';
import { WritingEditor } from './components/StudentView/WritingEditor';
import { SelfCheckView } from './components/StudentView/SelfCheckView';
import { ReflectionView } from './components/StudentView/ReflectionView';
import { ShopView } from './components/StudentView/ShopView';

import { TeacherDashboard } from './components/TeacherView/TeacherDashboard';
import { TeacherFeedbackModal } from './components/TeacherView/TeacherFeedbackModal';
import { RewardConfigModal } from './components/TeacherView/RewardConfigModal';
import { ShopManagerModal } from './components/TeacherView/ShopManagerModal';
import { DataBackupModal } from './components/TeacherView/DataBackupModal';

export function App() {
  const [mode, setMode] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [studentTab, setStudentTab] = useState<string>('DASHBOARD');

  // App Data
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | undefined>(undefined);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);

  // Modals
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState<boolean>(false);
  const [feedbackStudent, setFeedbackStudent] = useState<{ student: Student; writing?: Writing } | null>(null);
  const [isRewardConfigOpen, setIsRewardConfigOpen] = useState<boolean>(false);
  const [isShopManagerOpen, setIsShopManagerOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Load Data
  const refreshAllData = () => {
    const loadedStudents = StorageService.getStudents();
    setStudents(loadedStudents);

    if (!currentStudent && loadedStudents.length > 0) {
      setCurrentStudent(loadedStudents[0]);
    } else if (currentStudent) {
      const updated = loadedStudents.find(s => s.id === currentStudent.id);
      if (updated) setCurrentStudent(updated);
    }

    const loadedTopics = StorageService.getTopics();
    setTopics(loadedTopics);

    const loadedWritings = StorageService.getWritings();
    setWritings(loadedWritings);

    if (currentStudent) {
      setRewardEvents(StorageService.getRewardEvents(currentStudent.id));
    } else {
      setRewardEvents(StorageService.getRewardEvents());
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      setRewardEvents(StorageService.getRewardEvents(currentStudent.id));
    }
  }, [currentStudent]);

  const currentTopic = topics[0];
  const currentWriting = (currentStudent && currentTopic) 
    ? writings.find(w => w.studentId === currentStudent.id && w.topicId === currentTopic.id)
    : undefined;

  // Student Actions
  const handleSaveDraft = (content: string) => {
    if (!currentStudent || !currentTopic) return;

    let writing = currentWriting;
    if (!writing) {
      writing = {
        id: `writing-${Date.now()}`,
        studentId: currentStudent.id,
        topicId: currentTopic.id,
        currentStatus: 'DRAFTING',
        versions: [],
        grantedStages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const draftIdx = writing.versions.findIndex(v => v.versionType === 'DRAFT');
    const sentenceCount = content.split(/[.!?\n]+/).filter(s => s.trim().length > 0).length;

    if (draftIdx !== -1) {
      writing.versions[draftIdx].content = content;
      writing.versions[draftIdx].sentenceCount = sentenceCount;
    } else {
      writing.versions.push({
        id: `v-draft-${Date.now()}`,
        writingId: writing.id,
        versionType: 'DRAFT',
        content,
        sentenceCount,
        createdAt: new Date().toISOString()
      });
    }

    StorageService.saveWriting(writing);
    refreshAllData();
  };

  const handleSubmitDraft = (content: string) => {
    handleSaveDraft(content);
    if (!currentStudent || !currentTopic) return;

    const writing = StorageService.getWritingByStudentAndTopic(currentStudent.id, currentTopic.id);
    if (writing) {
      writing.currentStatus = 'DRAFT_SUBMITTED';
      StorageService.saveWriting(writing);

      // 초안 제출 보상 자동 지급
      StorageService.grantStageReward(currentStudent.id, writing.id, 'DRAFT_SUBMITTED');
    }

    refreshAllData();
    setStudentTab('DASHBOARD');
  };

  const handleSubmitSelfCheck = (answers: Record<string, boolean>, opinion: string) => {
    if (!currentWriting) return;

    currentWriting.selfCheck = {
      id: `sc-${Date.now()}`,
      writingId: currentWriting.id,
      checklistAnswers: answers,
      freeTextOpinion: opinion,
      createdAt: new Date().toISOString()
    };
    currentWriting.currentStatus = 'SELF_CHECKED';
    StorageService.saveWriting(currentWriting);

    // 자기점검 완료 보상 지급
    StorageService.grantStageReward(currentStudent!.id, currentWriting.id, 'SELF_CHECKED');

    refreshAllData();
    setStudentTab('DASHBOARD');
  };

  const handleSubmitRevision = (content: string) => {
    if (!currentWriting) return;

    const sentenceCount = content.split(/[.!?\n]+/).filter(s => s.trim().length > 0).length;
    const revIdx = currentWriting.versions.findIndex(v => v.versionType === 'REVISED');

    if (revIdx !== -1) {
      currentWriting.versions[revIdx].content = content;
      currentWriting.versions[revIdx].sentenceCount = sentenceCount;
    } else {
      currentWriting.versions.push({
        id: `v-rev-${Date.now()}`,
        writingId: currentWriting.id,
        versionType: 'REVISED',
        content,
        sentenceCount,
        createdAt: new Date().toISOString()
      });
    }

    currentWriting.currentStatus = 'REREVISED';
    StorageService.saveWriting(currentWriting);

    // 고쳐쓰기 완료 보상 지급
    StorageService.grantStageReward(currentStudent!.id, currentWriting.id, 'REREVISED');

    refreshAllData();
    setStudentTab('DASHBOARD');
  };

  const handleSubmitReflection = (content: string) => {
    if (!currentWriting) return;

    currentWriting.reflection = {
      id: `rf-${Date.now()}`,
      writingId: currentWriting.id,
      content,
      createdAt: new Date().toISOString()
    };
    currentWriting.currentStatus = 'REFLECTED';
    StorageService.saveWriting(currentWriting);

    // 성찰글 완료 보상 지급
    StorageService.grantStageReward(currentStudent!.id, currentWriting.id, 'REFLECTED');

    refreshAllData();
    setStudentTab('DASHBOARD');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', paddingBottom: 60 }}>
      {/* App Header */}
      <Header
        mode={mode}
        currentStudent={currentStudent}
        onSwitchMode={(newMode) => {
          setMode(newMode);
          if (newMode === 'STUDENT') setStudentTab('DASHBOARD');
        }}
        onOpenStudentSelect={() => setIsStudentSelectOpen(true)}
        currentTab={studentTab}
        onChangeTab={setStudentTab}
      />

      {/* Main View Area */}
      <main style={{ padding: '24px 20px', maxWidth: 1280, margin: '0 auto' }}>
        {mode === 'STUDENT' ? (
          <>
            {studentTab === 'DASHBOARD' && currentStudent && currentTopic && (
              <StudentDashboard
                student={currentStudent}
                topic={currentTopic}
                writing={currentWriting}
                rewardEvents={rewardEvents}
                onStartDraft={() => setStudentTab('EDITOR')}
                onStartSelfCheck={() => setStudentTab('SELF_CHECK')}
                onStartRevision={() => setStudentTab('REVISION_EDITOR')}
                onStartReflection={() => setStudentTab('REFLECTION')}
              />
            )}

            {studentTab === 'EDITOR' && currentTopic && (
              <WritingEditor
                topic={currentTopic}
                writing={currentWriting}
                isRevision={false}
                onSaveDraft={handleSaveDraft}
                onSubmitDraft={handleSubmitDraft}
                onSubmitRevision={handleSubmitRevision}
                onCancel={() => setStudentTab('DASHBOARD')}
              />
            )}

            {studentTab === 'REVISION_EDITOR' && currentTopic && currentWriting && (
              <WritingEditor
                topic={currentTopic}
                writing={currentWriting}
                isRevision={true}
                onSaveDraft={handleSaveDraft}
                onSubmitDraft={handleSubmitDraft}
                onSubmitRevision={handleSubmitRevision}
                onCancel={() => setStudentTab('DASHBOARD')}
              />
            )}

            {studentTab === 'SELF_CHECK' && currentTopic && currentWriting && (
              <SelfCheckView
                topic={currentTopic}
                writing={currentWriting}
                onSubmitSelfCheck={handleSubmitSelfCheck}
                onCancel={() => setStudentTab('DASHBOARD')}
              />
            )}

            {studentTab === 'REFLECTION' && currentWriting && (
              <ReflectionView
                writing={currentWriting}
                onSubmitReflection={handleSubmitReflection}
                onCancel={() => setStudentTab('DASHBOARD')}
              />
            )}

            {studentTab === 'SHOP' && currentStudent && (
              <ShopView
                student={currentStudent}
                onRefreshStudent={refreshAllData}
              />
            )}
          </>
        ) : (
          /* TEACHER MODE */
          currentTopic && (
            <TeacherDashboard
              students={students}
              topic={currentTopic}
              writings={writings}
              onOpenFeedbackModal={(st, wr) => setFeedbackStudent({ student: st, writing: wr })}
              onOpenRewardConfig={() => setIsRewardConfigOpen(true)}
              onOpenShopManager={() => setIsShopManagerOpen(true)}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
              onRefreshData={refreshAllData}
            />
          )
        )}
      </main>

      {/* Modals */}
      {isStudentSelectOpen && (
        <StudentSelectModal
          students={students}
          currentStudent={currentStudent}
          onSelectStudent={(st) => {
            setCurrentStudent(st);
            refreshAllData();
          }}
          onClose={() => setIsStudentSelectOpen(false)}
        />
      )}

      {feedbackStudent && (
        <TeacherFeedbackModal
          student={feedbackStudent.student}
          writing={feedbackStudent.writing}
          onClose={() => setFeedbackStudent(null)}
          onRefresh={refreshAllData}
        />
      )}

      {isRewardConfigOpen && (
        <RewardConfigModal
          students={students}
          onClose={() => setIsRewardConfigOpen(false)}
          onRefresh={refreshAllData}
        />
      )}

      {isShopManagerOpen && (
        <ShopManagerModal
          students={students}
          onClose={() => setIsShopManagerOpen(false)}
          onRefresh={refreshAllData}
        />
      )}

      {isBackupModalOpen && (
        <DataBackupModal
          onClose={() => setIsBackupModalOpen(false)}
          onRefresh={refreshAllData}
        />
      )}
    </div>
  );
}

export default App;
