"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Type definitions
interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface NotificationData {
  message: string;
  title?: string;
  progress?: number;
  type?: "success" | "error" | "warning" | "info" | "processing";
}

interface Notification {
  timestamp: string;
  data: NotificationData;
  action?: NotificationAction;
}

interface NotificationPopoverProps {
  notifications: Notification[];
  isConnected: boolean;
  clearNotifications: () => void;
  isCollapsed?: boolean;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications = [],
  isConnected = false,
  clearNotifications,
  isCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getNotificationIcon = (type?: string) => {
    const iconProps = { className: "w-4 h-4 flex-shrink-0" };
    switch (type) {
      case "success":
        return (
          <CheckCircle
            {...iconProps}
            className="w-4 h-4 text-green-500 flex-shrink-0"
          />
        );
      case "error":
        return (
          <XCircle
            {...iconProps}
            className="w-4 h-4 text-red-500 flex-shrink-0"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            {...iconProps}
            className="w-4 h-4 text-yellow-500 flex-shrink-0"
          />
        );
      case "processing":
        return (
          <Clock
            {...iconProps}
            className="w-4 h-4 text-blue-500 flex-shrink-0"
          />
        );
      default:
        return (
          <Info
            {...iconProps}
            className="w-4 h-4 text-blue-500 flex-shrink-0"
          />
        );
    }
  };

  const getNotificationBg = (type?: string): string => {
    const baseClasses =
      "border-l-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]";

    switch (type) {
      case "success":
        return `${baseClasses} border-l-green-500 bg-green-50/50 dark:bg-green-950/20`;
      case "error":
        return `${baseClasses} border-l-red-500 bg-red-50/50 dark:bg-red-950/20`;
      case "warning":
        return `${baseClasses} border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20`;
      case "processing":
        return `${baseClasses} border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20`;
      default:
        return `${baseClasses} border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20`;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className="w-full justify-start relative group"
        >
          <motion.div
            animate={
              notifications.length > 0 ? { scale: [1, 1.1, 1] } : { scale: 1 }
            }
            transition={{
              duration: 0.5,
              repeat: notifications.length > 0 ? Infinity : 0,
              repeatDelay: 3,
            }}
          >
            <Bell className="w-4 h-4" />
          </motion.div>
          {!isCollapsed && <span className="ml-2">Notifications</span>}

          <AnimatePresence>
            {notifications.length > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                >
                  {notifications.length > 99 ? "99+" : notifications.length}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 shadow-2xl border-0 bg-background/95 backdrop-blur-sm"
        align="start"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center space-x-3">
                {/* Connection Status */}
                <motion.div
                  className="flex items-center space-x-1"
                  animate={isConnected ? { opacity: 1 } : { opacity: 0.5 }}
                >
                  <motion.span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                    animate={
                      isConnected ? { scale: [1, 1.2, 1] } : { scale: 1 }
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </motion.div>

                {/* Clear All Button */}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center text-muted-foreground"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <Bell className="w-12 h-12 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1 opacity-75">
                    We'll notify you when something important happens
                  </p>
                </motion.div>
              ) : (
                <div className="divide-y divide-border/50">
                  {[...notifications]
                    .reverse()
                    .map((notification: Notification, index: number) => (
                      <motion.div
                        key={`${notification.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          layout: { duration: 0.2 },
                        }}
                        layout
                        className={cn(
                          "p-4 transition-all duration-200 cursor-pointer relative overflow-hidden group",
                          getNotificationBg(notification.data.type)
                        )}
                        whileHover={{ scale: 1.02 }}
                      >
                        {/* Background gradient effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />

                        <div className="flex items-start space-x-3 relative z-10">
                          {/* Icon */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: index * 0.05 + 0.1,
                              type: "spring",
                            }}
                          >
                            {getNotificationIcon(notification.data.type)}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {notification.data.title && (
                              <h4 className="text-sm font-semibold text-foreground mb-1">
                                {notification.data.title}
                              </h4>
                            )}
                            <p className="text-sm text-foreground leading-relaxed">
                              {notification.data.message}
                            </p>

                            {/* Progress Bar */}
                            {notification.data.progress !== undefined && (
                              <motion.div
                                className="mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
                                  <span>{notification.data.progress}%</span>
                                </div>
                                <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                                  <motion.div
                                    className="bg-primary h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${notification.data.progress}%`,
                                    }}
                                    transition={{
                                      delay: 0.4,
                                      duration: 0.6,
                                      ease: "easeOut",
                                    }}
                                  />
                                </div>
                              </motion.div>
                            )}

                            {/* Action Button */}
                            {notification.action && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-2"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    notification.action!.onClick();
                                  }}
                                  className="text-xs h-7"
                                >
                                  {notification.action.label}
                                </Button>
                              </motion.div>
                            )}

                            {/* Timestamp */}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                          </div>

                          {/* More Options */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem className="text-xs">
                                <Check className="w-3 h-3 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs text-destructive">
                                <Trash2 className="w-3 h-3 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-3 border-t border-border bg-muted/20"
            >
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export { NotificationPopover };
