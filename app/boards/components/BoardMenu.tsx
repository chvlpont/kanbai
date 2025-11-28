"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, LayoutDashboard, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface BoardMenuProps {
  boardId: string;
  inviteCode: string;
  onInviteCodeUpdate: (code: string) => void;
}

export default function BoardMenu({
  boardId,
  inviteCode,
  onInviteCodeUpdate,
}: BoardMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCopyInviteCode = async () => {
    try {
      let codeToShare = inviteCode;

      // Generate invite code if it doesn't exist
      if (!codeToShare) {
        const generateCode = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let code = "";
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };

        codeToShare = generateCode();

        // Save to database
        const supabase = createClient();
        const { error: updateError } = await supabase
          .from("boards")
          .update({ invite_code: codeToShare })
          .eq("id", boardId);

        if (updateError) {
          console.error("Failed to generate invite code:", updateError);
          toast.error("Failed to generate invite code");
          return;
        }

        // Update parent state
        onInviteCodeUpdate(codeToShare);
      }

      // Copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(codeToShare);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = codeToShare;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          throw err;
        }
        document.body.removeChild(textArea);
      }

      toast.success("Invite code copied to clipboard!");
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy invite code");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all border border-transparent hover:border-border"
        aria-label="Menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isMenuOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Dropdown */}
          <div
            className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-20 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/boards"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-muted transition-colors first:rounded-t-xl"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Dashboard
            </Link>
            <button
              onClick={handleCopyInviteCode}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-surface-muted transition-colors last:rounded-b-xl"
            >
              <Copy className="w-4 h-4 text-accent-green" />
              Copy Invite Code
            </button>
          </div>
        </>
      )}
    </div>
  );
}
