import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  BottomSheet,
  Header,
  LevelBadge,
  NeonCTAButton,
  ScoreBox,
  SecondaryButton,
  ShuttleIcon,
  Skeleton,
  StatusPill,
  Toast,
  ToastVariant,
} from "../../components";
import {
  clearMatchDraft,
  enqueuePendingMatchResult,
  getPendingMatchResults,
  getRepository,
  loadMatchDraft,
  removePendingMatchResult,
  saveMatchDraft,
  ScoreHistoryEntry,
} from "../../data";
import { calculateMatchElo } from "../../domain/elo/calculateElo";
import { validateMatchScores } from "../../domain/elo/scoreValidation";
import {
  MatchEloResult,
  MatchTeamPlayer,
  PlayerEloResult,
} from "../../domain/elo/types";
import { ratingToLevel } from "../../domain/rating/initialRating";
import {
  CourtCategory,
  MatchDoc,
  MatchSetScore,
  PostMatchCard,
  ReportReason,
  ReviewTag,
  UserProfile,
} from "../../domain/types";
import { useAuth, useHaptics, useSession } from "../../hooks";
import { PALETTE, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";

export interface ScoreMatchScreenProps {
  initialMatchId?: string;
  initialSessionId?: string;
  initialCourtId?: string;
  matchOverride?: MatchDoc;
  playersOverride?: Record<string, UserProfile>;
  currentUserIdOverride?: string;
  disableTimer?: boolean;
}

type ScreenStep = "scoring" | "review" | "elo_summary";

interface ReviewSelection {
  tag?: ReviewTag;
  reportReason?: ReportReason;
}

const REVIEW_TAG_OPTIONS: Array<{
  tag: ReviewTag;
  label: string;
  hint: string;
}> = [
  { tag: "correct_level", label: "Đúng trình", hint: "Chuẩn cấp" },
  { tag: "plays_better", label: "Đánh hay hơn", hint: "+Elo nếu >= 2 vote" },
  { tag: "good_attitude", label: "Thái độ tốt", hint: "+1 Uy tín" },
];

function formatElapsedTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getCategoryLabel(cat?: CourtCategory): string {
  if (cat === "men") return "Đôi nam";
  if (cat === "women") return "Đôi nữ";
  return "Đôi nam nữ";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VĐ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ScoreMatchScreen({
  initialMatchId,
  initialSessionId,
  initialCourtId,
  matchOverride,
  playersOverride,
  currentUserIdOverride,
  disableTimer = false,
}: ScoreMatchScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchId?: string;
    sessionId?: string;
    courtId?: string;
  }>();
  const { user } = useAuth();
  const { enabled: hapticsEnabled, trigger } = useHaptics(true);

  const sessionId = initialSessionId ?? params.sessionId ?? "session_tienson_05";
  const courtId = initialCourtId ?? params.courtId ?? "1";
  const paramMatchId = initialMatchId ?? params.matchId;

  const { session, courts, matches, loading } = useSession(
    matchOverride ? undefined : sessionId
  );

  const activeMatch = useMemo<MatchDoc | null>(() => {
    if (matchOverride) return matchOverride;
    if (paramMatchId) {
      const found = matches.find((m) => m.id === paramMatchId);
      if (found) return found;
    }
    const playingOnCourt = matches.find(
      (m) => m.courtId === courtId && m.status === "playing"
    );
    return playingOnCourt ?? matches[0] ?? null;
  }, [matchOverride, matches, paramMatchId, courtId]);

  const effectiveMatchId = activeMatch?.id ?? paramMatchId ?? "match_live_01";
  const currentUserId = currentUserIdOverride ?? user?.uid ?? "user_host_01";
  const hostId = session?.hostId ?? currentUserId;

  const [playersMap, setPlayersMap] = useState<Record<string, UserProfile>>(
    playersOverride ?? {}
  );
  const [sets, setSets] = useState<MatchSetScore[]>(
    activeMatch?.sets && activeMatch.sets.length > 0
      ? activeMatch.sets
      : [{ setNumber: 1, scoreA: 0, scoreB: 0 }]
  );
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [shuttleCount, setShuttleCount] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [step, setStep] = useState<ScreenStep>(
    activeMatch?.ratingProcessed || activeMatch?.status === "confirmed"
      ? "elo_summary"
      : "scoring"
  );
  const [reviewSelections, setReviewSelections] = useState<
    Record<string, ReviewSelection>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [eloSummary, setEloSummary] = useState<MatchEloResult | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: "", variant: "info" });

  const eloAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      setToast({ visible: true, message, variant });
    },
    []
  );

  // Tải hồ sơ 4 VĐV trong trận
  useEffect(() => {
    if (playersOverride) {
      setPlayersMap(playersOverride);
      return;
    }
    if (!activeMatch) return;
    const ids = [...activeMatch.teamA, ...activeMatch.teamB];
    let mounted = true;
    const loadProfiles = async () => {
      try {
        const repo = getRepository();
        const results = await Promise.all(ids.map((id) => repo.getProfile(id)));
        if (!mounted) return;
        const map: Record<string, UserProfile> = {};
        results.forEach((profile) => {
          if (profile) map[profile.uid] = profile;
        });
        setPlayersMap(map);
      } catch {
        // fallback sang roster hoặc ID
      }
    };
    void loadProfiles();
    return () => {
      mounted = false;
    };
  }, [activeMatch, playersOverride]);

  // Khôi phục bản nháp tỷ số từ AsyncStorage (chống mất điểm khi xoay máy / app nền)
  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      const [draft, pending] = await Promise.all([
        loadMatchDraft(effectiveMatchId),
        getPendingMatchResults(),
      ]);
      if (!mounted) return;
      setPendingQueueCount(pending.length);
      if (draft && !activeMatch?.ratingProcessed) {
        if (draft.sets.length > 0) setSets(draft.sets);
        setActiveSetIndex(
          Math.min(draft.activeSetIndex, Math.max(0, draft.sets.length - 1))
        );
        setHistory(draft.history ?? []);
        setShuttleCount(draft.shuttleCount || 1);
        setElapsedSeconds(draft.elapsedSeconds || 0);
      } else if (activeMatch?.sets && activeMatch.sets.length > 0) {
        setSets(activeMatch.sets);
      }
      setDraftHydrated(true);
    };
    void hydrate();
    return () => {
      mounted = false;
    };
  }, [effectiveMatchId, activeMatch?.ratingProcessed]);

  // Lưu nháp mỗi khi điểm, lịch sử hoặc số quả cầu thay đổi
  useEffect(() => {
    if (!draftHydrated || step === "elo_summary") return;
    void saveMatchDraft({
      matchId: effectiveMatchId,
      sets,
      activeSetIndex,
      history,
      shuttleCount,
      elapsedSeconds,
      updatedAt: new Date().toISOString(),
    });
  }, [
    draftHydrated,
    step,
    effectiveMatchId,
    sets,
    activeSetIndex,
    history,
    shuttleCount,
    elapsedSeconds,
  ]);

  // Lưu ngay lập tức khi app chuyển sang background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState !== "active" && step !== "elo_summary") {
        void saveMatchDraft({
          matchId: effectiveMatchId,
          sets,
          activeSetIndex,
          history,
          shuttleCount,
          elapsedSeconds,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    return () => {
      sub.remove();
    };
  }, [
    effectiveMatchId,
    sets,
    activeSetIndex,
    history,
    shuttleCount,
    elapsedSeconds,
    step,
  ]);

  // Đồng hồ đếm thời gian trận đấu
  useEffect(() => {
    if (disableTimer || step === "elo_summary" || activeMatch?.ratingProcessed) {
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [disableTimer, step, activeMatch?.ratingProcessed]);

  const courtRoster = useMemo(() => {
    const court = courts.find((c) => c.id === courtId);
    return court?.roster ?? [];
  }, [courts, courtId]);

  const resolvePlayerMeta = useCallback(
    (memberId: string): MatchTeamPlayer => {
      const profile = playersMap[memberId];
      if (profile) {
        return {
          userId: profile.uid,
          displayName: profile.displayName,
          currentRating: profile.skill.rating,
          matchesPlayed: profile.skill.matchesPlayed,
          isProvisional: profile.skill.isProvisional,
          currentReliability: profile.skill.reliability,
          isGhost: false,
        };
      }
      const rosterItem = courtRoster.find((r) => r.memberId === memberId);
      if (rosterItem) {
        return {
          userId: rosterItem.memberId,
          displayName: rosterItem.displayName,
          currentRating: rosterItem.rating,
          matchesPlayed: rosterItem.isGhost ? 5 : 0,
          isProvisional: !rosterItem.isGhost,
          currentReliability: 80,
          isGhost: rosterItem.isGhost,
        };
      }
      return {
        userId: memberId,
        displayName: memberId,
        currentRating: 1400,
        matchesPlayed: 5,
        isProvisional: false,
        currentReliability: 80,
        isGhost: true,
      };
    },
    [playersMap, courtRoster]
  );

  const teamAPlayers = useMemo<[MatchTeamPlayer, MatchTeamPlayer]>(() => {
    const ids = activeMatch?.teamA ?? ["player_a1", "player_a2"];
    return [resolvePlayerMeta(ids[0]), resolvePlayerMeta(ids[1])];
  }, [activeMatch, resolvePlayerMeta]);

  const teamBPlayers = useMemo<[MatchTeamPlayer, MatchTeamPlayer]>(() => {
    const ids = activeMatch?.teamB ?? ["player_b1", "player_b2"];
    return [resolvePlayerMeta(ids[0]), resolvePlayerMeta(ids[1])];
  }, [activeMatch, resolvePlayerMeta]);

  const currentSet = sets[activeSetIndex] ?? {
    setNumber: activeSetIndex + 1,
    scoreA: 0,
    scoreB: 0,
  };

  const scoreValidation = useMemo(() => validateMatchScores(sets), [sets]);

  const handleIncrementScore = useCallback(
    (team: "A" | "B") => {
      if (step !== "scoring" || activeMatch?.ratingProcessed) return;
      const targetScore = team === "A" ? currentSet.scoreA : currentSet.scoreB;
      if (targetScore >= 30) {
        showToast("Điểm tối đa theo luật BWF là 30 điểm.", "warning");
        return;
      }

      setScoreError(null);
      setSets((prev) =>
        prev.map((s, idx) => {
          if (idx !== activeSetIndex) return s;
          return team === "A"
            ? { ...s, scoreA: s.scoreA + 1 }
            : { ...s, scoreB: s.scoreB + 1 };
        })
      );
      setHistory((prev) => [...prev, { setIndex: activeSetIndex, team }]);
    },
    [
      step,
      activeMatch?.ratingProcessed,
      currentSet.scoreA,
      currentSet.scoreB,
      activeSetIndex,
      showToast,
    ]
  );

  const handleUndoScore = useCallback(() => {
    if (history.length === 0 || step !== "scoring") {
      showToast("Chưa có điểm nào để hoàn tác.", "info");
      return;
    }
    const lastAction = history[history.length - 1];
    trigger("tap");
    setScoreError(null);
    setSets((prev) =>
      prev.map((s, idx) => {
        if (idx !== lastAction.setIndex) return s;
        return lastAction.team === "A"
          ? { ...s, scoreA: Math.max(0, s.scoreA - 1) }
          : { ...s, scoreB: Math.max(0, s.scoreB - 1) };
      })
    );
    setActiveSetIndex(lastAction.setIndex);
    setHistory((prev) => prev.slice(0, -1));
  }, [history, step, trigger, showToast]);

  const handleAddShuttle = useCallback(() => {
    if (step !== "scoring") return;
    trigger("tap");
    setShuttleCount((prev) => {
      const next = prev + 1;
      showToast(`Đã đổi cầu mới (Quả thứ ${next}).`, "info");
      return next;
    });
  }, [step, trigger, showToast]);

  const handleAddSet = useCallback(() => {
    if (sets.length >= 3) {
      showToast("Tối đa 3 set theo luật Best of 3.", "warning");
      return;
    }
    trigger("tap");
    const nextNumber = sets.length + 1;
    setSets((prev) => [...prev, { setNumber: nextNumber, scoreA: 0, scoreB: 0 }]);
    setActiveSetIndex(sets.length);
    setScoreError(null);
  }, [sets.length, trigger, showToast]);

  const handleRemoveLastSet = useCallback(() => {
    if (sets.length <= 1) return;
    trigger("tap");
    const removedIdx = sets.length - 1;
    setSets((prev) => prev.slice(0, -1));
    setHistory((prev) => prev.filter((h) => h.setIndex !== removedIdx));
    setActiveSetIndex((prev) => Math.min(prev, removedIdx - 1));
    setScoreError(null);
  }, [sets.length, trigger]);

  const handlePressFinishMatch = useCallback(() => {
    const validation = validateMatchScores(sets);
    if (!validation.isValid) {
      const msg =
        validation.error ??
        "Tỷ số chưa hợp lệ theo luật cầu lông BWF (chạm 21, cách biệt >= 2, tối đa 30).";
      setScoreError(msg);
      showToast(msg, "error");
      return;
    }
    setScoreError(null);
    trigger("success");
    setStep("review");
  }, [sets, showToast, trigger]);

  const handleSelectReviewTag = useCallback(
    (targetUserId: string, tag: ReviewTag) => {
      // Chặn tuyệt đối tự chấm mình tại UI
      if (targetUserId === currentUserId) {
        showToast("Bạn không thể tự chấm thẻ đánh giá cho chính mình.", "warning");
        return;
      }
      trigger("tap");
      setReviewSelections((prev) => {
        const existing = prev[targetUserId];
        const nextTag = existing?.tag === tag ? undefined : tag;
        return {
          ...prev,
          [targetUserId]: {
            ...existing,
            tag: nextTag,
          },
        };
      });
    },
    [currentUserId, trigger, showToast]
  );

  const handleToggleFakeReport = useCallback(
    (targetUserId: string) => {
      if (targetUserId === currentUserId) return;
      trigger("tap");
      setReviewSelections((prev) => {
        const existing = prev[targetUserId];
        const nextReport: ReportReason | undefined =
          existing?.reportReason === "fake_level" ? undefined : "fake_level";
        return {
          ...prev,
          [targetUserId]: {
            ...existing,
            reportReason: nextReport,
          },
        };
      });
    },
    [currentUserId, trigger]
  );

  const buildFilteredCards = useCallback(
    (skipCards: boolean): PostMatchCard[] => {
      if (skipCards) return [];
      const cards: PostMatchCard[] = [];
      Object.entries(reviewSelections).forEach(([toUserId, sel]) => {
        // Bảo vệ lớp 2: không bao giờ gửi thẻ tự chấm mình
        if (toUserId === currentUserId) return;
        if (sel.tag || sel.reportReason) {
          cards.push({
            fromUserId: currentUserId,
            toUserId,
            tag: sel.tag,
            reportReason: sel.reportReason,
          });
        }
      });
      return cards;
    },
    [reviewSelections, currentUserId]
  );

  const handleSubmitMatchResult = useCallback(
    async (skipCards: boolean = false) => {
      // Idempotent guard ở UI: chống bấm hai lần
      if (isSubmitting || step === "elo_summary" || activeMatch?.ratingProcessed) {
        return;
      }

      const validation = validateMatchScores(sets);
      if (!validation.isValid || !validation.winner) {
        setSubmitError(validation.error ?? "Tỷ số trận đấu không hợp lệ.");
        return;
      }

      const cards = buildFilteredCards(skipCards);
      setIsSubmitting(true);
      setSubmitError(null);

      // Tính trước kết quả Elo theo hàm thuần TV1 để hiển thị chính xác ngay cả khi đối chiếu
      const computedElo = calculateMatchElo({
        teamA: teamAPlayers,
        teamB: teamBPlayers,
        winner: validation.winner,
        sets,
        reviewCards: cards,
      });

      try {
        const repo = getRepository();
        await repo.saveMatchScore(effectiveMatchId, sets);
        await repo.confirmMatchResult(effectiveMatchId, hostId, cards);

        const nextPending = await removePendingMatchResult(effectiveMatchId);
        setPendingQueueCount(nextPending.length);
        await clearMatchDraft(effectiveMatchId);

        setEloSummary(computedElo);
        setStep("elo_summary");
        trigger("success");
        showToast("Đã chốt tỷ số & cập nhật Elo thành công!", "success");

        Animated.spring(eloAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
          tension: 50,
        }).start();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể gửi kết quả lên máy chủ. Đã lưu vào hàng đợi offline.";
        const nextPending = await enqueuePendingMatchResult({
          matchId: effectiveMatchId,
          hostId,
          sets,
          cards,
          queuedAt: new Date().toISOString(),
        });
        setPendingQueueCount(nextPending.length);
        setSubmitError(message);
        showToast("Mất kết nối — Đã lưu vào hàng đợi đồng bộ offline.", "warning");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      step,
      activeMatch?.ratingProcessed,
      sets,
      buildFilteredCards,
      teamAPlayers,
      teamBPlayers,
      effectiveMatchId,
      hostId,
      trigger,
      showToast,
      eloAnim,
    ]
  );

  // Nếu trận đã được xác nhận từ trước, dựng sẵn bản tóm tắt để hiển thị
  useEffect(() => {
    if (
      activeMatch?.ratingProcessed &&
      !eloSummary &&
      activeMatch.sets.length > 0
    ) {
      const val = validateMatchScores(activeMatch.sets);
      const winner = activeMatch.winner ?? val.winner ?? "teamA";
      const preview = calculateMatchElo({
        teamA: teamAPlayers,
        teamB: teamBPlayers,
        winner,
        sets: activeMatch.sets,
        reviewCards: activeMatch.cards,
      });
      setEloSummary(preview);
      setStep("elo_summary");
      eloAnim.setValue(1);
    }
  }, [activeMatch, eloSummary, teamAPlayers, teamBPlayers, eloAnim]);

  const allPlayersInMatch = useMemo(
    () => [
      ...teamAPlayers.map((p) => ({ ...p, team: "A" as const })),
      ...teamBPlayers.map((p) => ({ ...p, team: "B" as const })),
    ],
    [teamAPlayers, teamBPlayers]
  );

  const renderEloPlayerRow = (res: PlayerEloResult, team: "A" | "B") => {
    const isPositive = res.delta >= 0;
    const teamColor = team === "A" ? PALETTE.teamA.cyan : PALETTE.teamB.amber;
    const newLevel = ratingToLevel(res.newRating);

    return (
      <Animated.View
        key={res.userId}
        testID={`elo-result-${res.userId}`}
        style={[
          styles.eloResultCard,
          { borderLeftColor: teamColor },
          {
            opacity: eloAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 1],
            }),
            transform: [
              {
                scale: eloAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.eloRowTop}>
          <View style={styles.eloIdentity}>
            <View
              style={[
                styles.avatarCircle,
                { borderColor: teamColor, backgroundColor: PALETTE.bg.surface },
              ]}
            >
              <Text style={[styles.avatarText, { color: teamColor }]}>
                {getInitials(res.displayName)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName} numberOfLines={1}>
                {res.displayName}
              </Text>
              <View style={styles.badgeLine}>
                <LevelBadge level={newLevel} compact size="sm" />
                <Text style={styles.kFactorPill}>
                  {res.isGhost
                    ? "Khách (Ghost)"
                    : res.isProvisional
                      ? `Hiệu chỉnh K=${res.kFactor}`
                      : `Chuẩn K=${res.kFactor}`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.deltaBadgeWrap}>
            <Text
              style={[
                styles.deltaBigText,
                {
                  color: res.isGhost
                    ? PALETTE.text.muted
                    : isPositive
                      ? PALETTE.accent.primary
                      : PALETTE.teamB.coral,
                },
              ]}
            >
              {res.isGhost
                ? "0 Elo"
                : `${isPositive ? "+" : ""}${res.delta} Elo`}
            </Text>
          </View>
        </View>

        <View style={styles.eloTransitionRow}>
          <Text style={styles.transitionText}>
            Elo:{" "}
            <Text style={styles.oldValText}>{res.oldRating}</Text> →{" "}
            <Text style={styles.newValText}>{res.newRating}</Text>
          </Text>
          <Text style={styles.transitionText}>
            Uy tín:{" "}
            <Text style={styles.oldValText}>{res.oldReliability}</Text> →{" "}
            <Text style={styles.newValText}>
              {res.newReliability} (
              {res.reliabilityDelta >= 0 ? "+" : ""}
              {res.reliabilityDelta})
            </Text>
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (loading && !matchOverride && !activeMatch) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Header
          title="Chấm Điểm Trận Đấu"
          subtitle="Đang tải dữ liệu sân..."
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingWrap}>
          <Skeleton height={80} borderRadius={RADIUS.lg} />
          <Skeleton height={240} borderRadius={RADIUS.xl} />
          <Skeleton height={58} borderRadius={RADIUS.pill} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Header
        title={session?.venueName ?? "Sân Cầu Lông Tiên Sơn"}
        subtitle={`Sân 0${courtId} • ${getCategoryLabel(
          activeMatch?.category ?? "mixed"
        )}`}
        status={{
          variant: step === "elo_summary" ? "open" : "playing",
          label: step === "elo_summary" ? "ĐÃ CHỐT" : "LIVE",
        }}
        onBackPress={() => router.back()}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Layer 1: Header Sân Live, Thời gian & Offline Queue */}
        <View style={styles.metaBar}>
          <StatusPill
            variant={step === "elo_summary" ? "open" : "live"}
            label={
              step === "elo_summary"
                ? "HOÀN THÀNH TRẬN ĐẤU"
                : `SÂN 0${courtId} • ĐANG ĐẤU`
            }
          />
          <View style={styles.timerPill} testID="match-timer-pill">
            <Text style={styles.timerText}>
              ⏱ {formatElapsedTime(elapsedSeconds)}
            </Text>
          </View>
          <View style={styles.shuttlePill} testID="shuttle-count-pill">
            <ShuttleIcon size={14} color={PALETTE.accent.primary} />
            <Text style={styles.shuttlePillText}>Cầu: {shuttleCount}</Text>
          </View>
        </View>

        {pendingQueueCount > 0 && (
          <View style={styles.offlineBanner} testID="offline-queue-banner">
            <Text style={styles.offlineBannerText}>
              Đang chờ đồng bộ offline ({pendingQueueCount} trận) — Dữ liệu đã lưu
              an toàn trên máy.
            </Text>
          </View>
        )}

        {/* Matchup Lineup Card */}
        <View style={styles.lineupCard}>
          <View style={styles.lineupTeamCol}>
            <Text style={[styles.teamHeaderLabel, { color: PALETTE.teamA.cyan }]}>
              ĐỘI A (CYAN)
            </Text>
            {teamAPlayers.map((p) => (
              <View key={p.userId} style={styles.lineupPlayerRow}>
                <Text style={styles.lineupPlayerName} numberOfLines={1}>
                  {p.displayName}
                </Text>
                <Text style={styles.lineupPlayerElo}>{p.currentRating}</Text>
              </View>
            ))}
          </View>

          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.lineupTeamCol}>
            <Text
              style={[
                styles.teamHeaderLabel,
                { color: PALETTE.teamB.amber, textAlign: "right" },
              ]}
            >
              ĐỘI B (AMBER)
            </Text>
            {teamBPlayers.map((p) => (
              <View key={p.userId} style={styles.lineupPlayerRowRight}>
                <Text style={styles.lineupPlayerElo}>{p.currentRating}</Text>
                <Text
                  style={[styles.lineupPlayerName, { textAlign: "right" }]}
                  numberOfLines={1}
                >
                  {p.displayName}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {step === "elo_summary" && eloSummary ? (
          /* Màn hình 4.5: Tổng kết Elo trước & sau */
          <View style={styles.summarySection} testID="elo-summary-view">
            <View style={styles.winnerBanner}>
              <Text style={styles.winnerTitle}>
                🏆{" "}
                {eloSummary.winner === "teamA"
                  ? "ĐỘI A CHIẾN THẮNG!"
                  : "ĐỘI B CHIẾN THẮNG!"}
              </Text>
              <Text style={styles.winnerScoreLine}>
                Tỷ số:{" "}
                {sets
                  .map((s) => `Set ${s.setNumber}: ${s.scoreA}-${s.scoreB}`)
                  .join(" • ")}{" "}
                | Hệ số chênh điểm ×{eloSummary.scoreMarginMultiplier.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>BIẾN ĐỘNG ELO & UY TÍN (4 VĐV)</Text>

            {eloSummary.teamA.map((p) => renderEloPlayerRow(p, "A"))}
            {eloSummary.teamB.map((p) => renderEloPlayerRow(p, "B"))}
          </View>
        ) : (
          <>
            {/* Bộ chọn Set (1 Set hoặc Best of 3 theo BWF) */}
            <View style={styles.setTabsRow}>
              <View style={styles.setTabsLeft}>
                {sets.map((s, idx) => {
                  const isActive = idx === activeSetIndex;
                  return (
                    <Pressable
                      key={s.setNumber}
                      testID={`set-tab-${s.setNumber}`}
                      onPress={() => {
                        trigger("tap");
                        setActiveSetIndex(idx);
                      }}
                      style={[
                        styles.setTabPill,
                        isActive && styles.setTabPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.setTabText,
                          isActive && styles.setTabTextActive,
                        ]}
                      >
                        Set {s.setNumber}: {s.scoreA}-{s.scoreB}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.setTabsActions}>
                {sets.length < 3 && (
                  <Pressable
                    testID="btn-add-set"
                    onPress={handleAddSet}
                    style={styles.smallActionBtn}
                  >
                    <Text style={styles.smallActionText}>+ Set</Text>
                  </Pressable>
                )}
                {sets.length > 1 && (
                  <Pressable
                    testID="btn-remove-set"
                    onPress={handleRemoveLastSet}
                    style={styles.smallActionBtn}
                  >
                    <Text style={styles.smallActionText}>- Xóa</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Layer 2: Bảng Điểm Lớn 1 Tay */}
            <View style={styles.scoreBoardRow}>
              <ScoreBox
                testID="score-box-a"
                team="A"
                teamLabel={`Đội A (${teamAPlayers[0].displayName.split(" ").pop()})`}
                score={currentSet.scoreA}
                onIncrement={() => handleIncrementScore("A")}
                hapticsEnabled={hapticsEnabled}
                style={styles.giantScoreBox}
              />
              <ScoreBox
                testID="score-box-b"
                team="B"
                teamLabel={`Đội B (${teamBPlayers[0].displayName.split(" ").pop()})`}
                score={currentSet.scoreB}
                onIncrement={() => handleIncrementScore("B")}
                hapticsEnabled={hapticsEnabled}
                style={styles.giantScoreBox}
              />
            </View>

            {/* Layer 3: Thanh Công Cụ Nhanh (Hoàn Tác + Đổi Cầu Mới) */}
            <View style={styles.quickToolsRow}>
              <SecondaryButton
                testID="btn-undo-score"
                label={
                  history.length > 0
                    ? `↩ Hoàn tác (${history[history.length - 1].team})`
                    : "↩ Hoàn tác điểm"
                }
                variant="outline"
                disabled={history.length === 0}
                onPress={handleUndoScore}
                style={styles.toolBtn}
              />
              <SecondaryButton
                testID="btn-add-shuttle"
                label={`🏸 +1 Quả cầu (${shuttleCount})`}
                variant="ghost"
                onPress={handleAddShuttle}
                style={styles.toolBtn}
              />
            </View>

            {/* Trạng thái kiểm tra luật BWF */}
            {scoreError ? (
              <View style={styles.errorBox} testID="bwf-score-error">
                <Text style={styles.errorText}>⚠️ {scoreError}</Text>
              </View>
            ) : (
              <View style={styles.ruleHintBox}>
                <Text style={styles.ruleHintText}>
                  {scoreValidation.isValid
                    ? `✓ Tỷ số hợp lệ theo luật BWF (${
                        scoreValidation.winner === "teamA" ? "Đội A" : "Đội B"
                      } thắng ${scoreValidation.setsWonA}-${scoreValidation.setsWonB}). Sẵn sàng kết thúc.`
                    : `Luật BWF: chạm 21 điểm (cách >= 2, tối đa 30-29). ${
                        scoreValidation.error ?? ""
                      }`}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Layer 4: Thumb-Zone Fixed Bottom CTA */}
      <View style={styles.bottomDock}>
        {step === "elo_summary" ? (
          <View style={styles.summaryActions}>
            <NeonCTAButton
              testID="btn-next-round"
              label="CHIA LƯỢT TIẾP THEO"
              onPress={() => router.replace("/court" as never)}
            />
            <SecondaryButton
              testID="btn-view-profile"
              label="Xem Hồ Sơ & Lịch Sử Elo"
              variant="outline"
              onPress={() => router.replace("/(tabs)/profile" as never)}
            />
          </View>
        ) : (
          <NeonCTAButton
            testID="btn-finish-match"
            label="KẾT THÚC & TRẢ SÂN"
            onPress={handlePressFinishMatch}
          />
        )}
      </View>

      {/* BottomSheet: Chấm điểm 5 giây sau trận */}
      <BottomSheet
        visible={step === "review"}
        title="Chấm điểm nhanh 5 giây"
        onClose={() => {
          if (!isSubmitting) setStep("scoring");
        }}
      >
        <ScrollView
          style={{ maxHeight: 430 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: SPACING.md, paddingBottom: SPACING.md }}
        >
          <Text style={styles.reviewIntro}>
            Chạm 1 lần để đánh giá đồng đội & đối thủ (có thể bỏ qua). Hệ thống
            không cho phép tự chấm chính mình.
          </Text>

          {allPlayersInMatch.map((player) => {
            const isSelf = player.userId === currentUserId;
            const selected = reviewSelections[player.userId];
            const teamColor =
              player.team === "A" ? PALETTE.teamA.cyan : PALETTE.teamB.amber;

            return (
              <View
                key={player.userId}
                testID={`review-player-${player.userId}`}
                style={[styles.reviewCard, { borderLeftColor: teamColor }]}
              >
                <View style={styles.reviewCardHeader}>
                  <Text style={styles.reviewPlayerName}>
                    {player.displayName} (Đội {player.team})
                  </Text>
                  {isSelf && (
                    <Text
                      style={styles.selfLockedLabel}
                      testID={`self-locked-${player.userId}`}
                    >
                      Bạn (không thể tự chấm mình)
                    </Text>
                  )}
                </View>

                {!isSelf && (
                  <View style={styles.tagRow}>
                    {REVIEW_TAG_OPTIONS.map((opt) => {
                      const active = selected?.tag === opt.tag;
                      return (
                        <Pressable
                          key={opt.tag}
                          testID={`review-tag-${player.userId}-${opt.tag}`}
                          onPress={() =>
                            handleSelectReviewTag(player.userId, opt.tag)
                          }
                          style={[
                            styles.tagPill,
                            active && styles.tagPillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagPillText,
                              active && styles.tagPillTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}

                    <Pressable
                      testID={`review-report-${player.userId}`}
                      onPress={() => handleToggleFakeReport(player.userId)}
                      style={[
                        styles.tagPill,
                        selected?.reportReason === "fake_level" &&
                          styles.reportPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagPillText,
                          selected?.reportReason === "fake_level" &&
                            styles.reportPillTextActive,
                        ]}
                      >
                        Khai khống
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          {submitError && (
            <View style={styles.errorBox} testID="submit-error-box">
              <Text style={styles.errorText}>⚠️ {submitError}</Text>
              <SecondaryButton
                testID="btn-retry-submit"
                label="Thử lại ngay"
                variant="outline"
                onPress={() => handleSubmitMatchResult(false)}
                style={{ marginTop: SPACING.xs }}
              />
            </View>
          )}

          <NeonCTAButton
            testID="btn-submit-match-result"
            label={
              isSubmitting ? "ĐANG CẬP NHẬT ELO..." : "XÁC NHẬN & CẬP NHẬT ELO"
            }
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={() => handleSubmitMatchResult(false)}
          />
          <SecondaryButton
            testID="btn-skip-review-submit"
            label="Bỏ qua thẻ, chốt kết quả ngay"
            variant="ghost"
            disabled={isSubmitting}
            onPress={() => handleSubmitMatchResult(true)}
          />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

export default function CourtScoreRoute() {
  return <ScoreMatchScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.bg.canvas,
  },
  loadingWrap: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  timerPill: {
    backgroundColor: PALETTE.surface.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  timerText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  shuttlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: PALETTE.surface.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: PALETTE.accent.primary,
  },
  shuttlePillText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.accent.primary,
    fontWeight: "700",
  },
  offlineBanner: {
    backgroundColor: "rgba(255, 179, 0, 0.16)",
    borderColor: PALETTE.teamB.amber,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  offlineBannerText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "600",
  },
  lineupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    gap: SPACING.sm,
  },
  lineupTeamCol: {
    flex: 1,
    gap: 4,
  },
  teamHeaderLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lineupPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  lineupPlayerRowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  lineupPlayerName: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.primary,
    fontWeight: "600",
    flex: 1,
  },
  lineupPlayerElo: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "700",
  },
  vsDivider: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PALETTE.bg.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  vsText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "800",
  },
  setTabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  setTabsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  setTabsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  setTabPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.surface.card,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    minHeight: 38,
    justifyContent: "center",
  },
  setTabPillActive: {
    borderColor: PALETTE.accent.primary,
    backgroundColor: "rgba(0, 255, 163, 0.14)",
  },
  setTabText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "600",
  },
  setTabTextActive: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  smallActionBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  smallActionText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  scoreBoardRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  giantScoreBox: {
    flex: 1,
    minHeight: 236,
  },
  quickToolsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  toolBtn: {
    flex: 1,
    minHeight: 54,
  },
  ruleHintBox: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
  },
  ruleHintText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: "rgba(255, 82, 82, 0.14)",
    borderColor: PALETTE.teamB.coral,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.teamB.coral,
    fontWeight: "600",
  },
  bottomDock: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: PALETTE.bg.canvas,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
  },
  summaryActions: {
    gap: SPACING.sm,
  },
  reviewIntro: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  reviewCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    borderLeftWidth: 4,
    gap: SPACING.xs,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.xs,
  },
  reviewPlayerName: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  selfLockedLabel: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.teamB.amber,
    fontWeight: "700",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tagPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.bg.surface,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    minHeight: 40,
    justifyContent: "center",
  },
  tagPillActive: {
    backgroundColor: "rgba(0, 255, 163, 0.16)",
    borderColor: PALETTE.accent.primary,
  },
  tagPillText: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "600",
  },
  tagPillTextActive: {
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  reportPillActive: {
    backgroundColor: "rgba(255, 82, 82, 0.18)",
    borderColor: PALETTE.teamB.coral,
  },
  reportPillTextActive: {
    color: PALETTE.teamB.coral,
    fontWeight: "800",
  },
  summarySection: {
    gap: SPACING.sm,
  },
  winnerBanner: {
    backgroundColor: "rgba(0, 255, 163, 0.12)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.accent.primary,
    alignItems: "center",
    gap: 4,
    ...SHADOWS.neonGlow,
  },
  winnerTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: PALETTE.accent.primary,
    fontWeight: "800",
  },
  winnerScoreLine: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.primary,
    textAlign: "center",
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.secondary,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: SPACING.xs,
  },
  eloResultCard: {
    backgroundColor: PALETTE.surface.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border.subtle,
    borderLeftWidth: 4,
    gap: SPACING.xs,
  },
  eloRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  eloIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "800",
  },
  playerName: {
    ...TYPOGRAPHY.body,
    color: PALETTE.text.primary,
    fontWeight: "700",
  },
  badgeLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: 2,
  },
  kFactorPill: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.text.muted,
    fontWeight: "600",
  },
  deltaBadgeWrap: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.bg.surface,
  },
  deltaBigText: {
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: "800",
  },
  eloTransitionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border.subtle,
  },
  transitionText: {
    ...TYPOGRAPHY.bodySmall,
    color: PALETTE.text.secondary,
  },
  oldValText: {
    color: PALETTE.text.muted,
    fontWeight: "600",
  },
  newValText: {
    color: PALETTE.text.primary,
    fontWeight: "800",
  },
});
