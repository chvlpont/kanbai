interface MembersDisplayProps {
  members: { id: string; username: string }[];
}

export default function MembersDisplay({ members }: MembersDisplayProps) {
  if (members.length === 0) return null;

  return (
    <>
      <div className="hidden sm:block h-6 w-px bg-border"></div>
      <div className="hidden sm:block relative group">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-full border border-border cursor-default">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-sm text-text-secondary font-medium">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>
        {/* Tooltip */}
        <div className="absolute left-0 top-full mt-2 w-48 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <p className="text-xs text-accent-purple font-semibold uppercase tracking-wide mb-2">
            Board Members
          </p>
          <div className="space-y-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 text-sm text-text-primary"
              >
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>{member.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
