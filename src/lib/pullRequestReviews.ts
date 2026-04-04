import type { PullRequestReview, PullRequestReviewSummary, User } from "../types";

function sortReviewsDescending(reviews: PullRequestReview[]): PullRequestReview[] {
  return [...reviews].sort((left, right) => new Date(right.submitted_at).getTime() - new Date(left.submitted_at).getTime());
}

export function summarizePullRequestReviews(
  reviews: PullRequestReview[],
  requestedReviewers: User[] = [],
): PullRequestReviewSummary {
  const approvedCount = reviews.filter((review) => review.state === "APPROVED").length;
  const changesRequestedCount = reviews.filter((review) => review.state === "CHANGES_REQUESTED").length;
  const commentedCount = reviews.filter((review) => review.state === "COMMENTED").length;
  const latestReview = sortReviewsDescending(reviews)[0] || null;

  let reviewDecision: PullRequestReviewSummary["reviewDecision"] = "none";
  if (changesRequestedCount > 0) {
    reviewDecision = "changes_requested";
  } else if (approvedCount > 0) {
    reviewDecision = "approved";
  } else if (requestedReviewers.length > 0) {
    reviewDecision = "pending";
  } else if (commentedCount > 0) {
    reviewDecision = "commented";
  }

  return {
    approvedCount,
    changesRequestedCount,
    commentedCount,
    requestedReviewers,
    latestReview,
    reviewDecision,
  };
}

export function getReviewDecisionLabel(reviewDecision: PullRequestReviewSummary["reviewDecision"]): string {
  switch (reviewDecision) {
    case "approved":
      return "Approved";
    case "changes_requested":
      return "Changes requested";
    case "commented":
      return "Commented";
    case "pending":
      return "Needs review";
    default:
      return "No reviews yet";
  }
}