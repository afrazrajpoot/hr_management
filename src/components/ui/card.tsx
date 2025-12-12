import * as React from "react"
import { cn } from "@/lib/utils"

// Main Card component with variant support
function Card({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "gradient" | "accent" | "success" | "warning" | "destructive" | "primary" | "secondary" }) {
  const variantStyles = {
    default: "bg-card text-card-foreground border-border shadow-hr-card hover:border-primary/30",
    gradient: "bg-gradient-to-br from-primary/5 via-card to-secondary/30 text-card-foreground border-primary/20 shadow-hr-card",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 text-card-foreground border-primary/30 shadow-hr-card",
    secondary: "bg-gradient-to-br from-secondary/30 to-secondary/10 text-secondary-foreground border-secondary/30 shadow-hr-card",
    accent: "bg-gradient-to-br from-accent/10 to-accent/5 text-accent-foreground border-accent/30 shadow-hr-card",
    success: "bg-gradient-to-br from-success/10 to-success/5 text-success-foreground border-success/30 shadow-hr-card",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 text-warning-foreground border-warning/30 shadow-hr-card",
    destructive: "bg-gradient-to-br from-destructive/10 to-destructive/5 text-destructive-foreground border-destructive/30 shadow-hr-card",
  }

  return (
    <div
      data-slot="card"
      className={cn(
        "group flex flex-col gap-6 rounded-xl border py-6 transition-all duration-300 hover:shadow-hr-hover hover:-translate-y-0.5",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

// Card Header component
function CardHeader({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "gradient" | "border" | "filled" }) {
  const variantStyles = {
    default: "",
    gradient: "bg-gradient-to-r from-primary/5 via-transparent to-primary/5",
    border: "border-b border-border/50 pb-6",
    filled: "bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg mx-6 p-4 -mt-2",
  }

  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

// Card Title component
function CardTitle({ className, size = "default", gradient = false, ...props }: React.ComponentProps<"div"> & { size?: "default" | "lg" | "xl" | "2xl", gradient?: boolean }) {
  const sizeStyles = {
    default: "text-lg md:text-xl",
    lg: "text-xl md:text-2xl",
    xl: "text-2xl md:text-3xl",
    "2xl": "text-3xl md:text-4xl",
  }

  const gradientStyle = gradient 
    ? "bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent" 
    : ""

  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-tight font-semibold tracking-tight",
        gradientStyle,
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
}

// Card Description component
function CardDescription({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "muted" | "accent" | "primary" }) {
  const variantStyles = {
    default: "text-muted-foreground",
    muted: "text-muted-foreground/80",
    accent: "text-accent",
    primary: "text-primary",
  }

  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-relaxed", variantStyles[variant], className)}
      {...props}
    />
  )
}

// Card Action component
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

// Card Content component
function CardContent({ className, padding = "default", ...props }: React.ComponentProps<"div"> & { padding?: "default" | "none" | "sm" | "lg" }) {
  const paddingStyles = {
    default: "px-6",
    none: "px-0",
    sm: "px-4",
    lg: "px-8",
  }

  return (
    <div
      data-slot="card-content"
      className={cn(paddingStyles[padding], className)}
      {...props}
    />
  )
}

// Card Footer component
function CardFooter({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "border" | "gradient" | "filled" }) {
  const variantStyles = {
    default: "",
    border: "border-t border-border/50 pt-6",
    gradient: "bg-gradient-to-r from-transparent via-primary/5 to-transparent pt-6",
    filled: "bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg mx-6 p-4 -mb-2",
  }

  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

// Enhanced Card with decorative elements
function CardDecorated({ 
  className, 
  decoration = "none",
  decorationColor = "primary",
  decorationSize = "default",
  ...props 
}: React.ComponentProps<"div"> & { 
  decoration?: "none" | "left-border" | "top-accent" | "corner" | "full-border" | "bottom-accent"
  decorationColor?: "primary" | "success" | "warning" | "destructive" | "accent" | "secondary"
  decorationSize?: "default" | "sm" | "lg"
}) {
  const decorationColors = {
    primary: "border-primary bg-gradient-to-r from-primary/80 to-primary",
    success: "border-success bg-gradient-to-r from-success/80 to-success",
    warning: "border-warning bg-gradient-to-r from-warning/80 to-warning",
    destructive: "border-destructive bg-gradient-to-r from-destructive/80 to-destructive",
    accent: "border-accent bg-gradient-to-r from-accent/80 to-accent",
    secondary: "border-secondary bg-gradient-to-r from-secondary/80 to-secondary",
  }

  const decorationSizes = {
    default: {
      left: "before:w-1",
      top: "before:h-1",
      corner: "before:h-12 before:w-12",
      full: "before:border-2",
    },
    sm: {
      left: "before:w-0.5",
      top: "before:h-0.5",
      corner: "before:h-8 before:w-8",
      full: "before:border",
    },
    lg: {
      left: "before:w-2",
      top: "before:h-2",
      corner: "before:h-16 before:w-16",
      full: "before:border-4",
    },
  }

  const decorationStyles = {
    none: "",
    "left-border": cn(
      "relative overflow-hidden",
      "before:absolute before:left-0 before:top-0 before:bottom-0",
      decorationSizes[decorationSize].left,
      "before:rounded-l-xl",
      decorationColors[decorationColor]
    ),
    "top-accent": cn(
      "relative overflow-hidden",
      "before:absolute before:left-0 before:right-0 before:top-0",
      decorationSizes[decorationSize].top,
      "before:rounded-t-xl",
      decorationColors[decorationColor]
    ),
    "bottom-accent": cn(
      "relative overflow-hidden",
      "before:absolute before:left-0 before:right-0 before:bottom-0",
      decorationSizes[decorationSize].top,
      "before:rounded-b-xl",
      decorationColors[decorationColor]
    ),
    corner: cn(
      "relative overflow-hidden",
      "before:absolute before:right-0 before:top-0",
      decorationSizes[decorationSize].corner,
      "before:translate-x-6 before:-translate-y-6 before:rotate-45",
      decorationColors[decorationColor]
    ),
    "full-border": cn(
      "relative",
      "before:absolute before:inset-0 before:border-2 before:border-transparent before:rounded-xl",
      "before:bg-gradient-to-br from-transparent via-transparent to-transparent",
      "before:[mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)]",
      "before:[mask-composite:exclude]",
      decorationColors[decorationColor].replace("bg-gradient", "before:bg-gradient")
    ),
  }

  return (
    <Card
      className={cn(
        decorationStyles[decoration],
        className
      )}
      {...props}
    />
  )
}

// Card with icon
function CardWithIcon({ 
  className,
  icon,
  iconPosition = "top",
  iconVariant = "default",
  iconColor = "primary",
  ...props 
}: React.ComponentProps<"div"> & {
  icon: React.ReactNode
  iconPosition?: "top" | "left" | "right" | "floating"
  iconVariant?: "default" | "circle" | "square" | "rounded"
  iconColor?: "primary" | "success" | "warning" | "destructive" | "accent" | "secondary"
}) {
  const iconColorStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    secondary: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  }

  const iconContainerStyles = {
    default: "p-2",
    circle: "p-3 rounded-full",
    square: "p-3 rounded-lg",
    rounded: "p-3 rounded-xl",
  }

  const iconBackgroundStyles = {
    default: "",
    circle: "bg-gradient-to-br from-primary/20 to-primary/5",
    square: "bg-gradient-to-br from-primary/15 to-primary/5",
    rounded: "bg-gradient-to-br from-primary/20 to-primary/10",
  }

  const positionStyles = {
    top: "flex-col items-center text-center",
    left: "flex-row items-start gap-4",
    right: "flex-row-reverse items-start gap-4",
    floating: "relative pt-12",
  }

  return (
    <Card className={cn(
      "relative",
      positionStyles[iconPosition],
      className
    )}>
      {iconPosition === "floating" && (
        <div className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2",
          iconContainerStyles[iconVariant],
          iconBackgroundStyles[iconVariant],
          iconColorStyles[iconColor],
          "border shadow-md"
        )}>
          {icon}
        </div>
      )}
      
      {iconPosition === "top" && (
        <div className={cn(
          "mb-4",
          iconContainerStyles[iconVariant],
          iconBackgroundStyles[iconVariant],
          iconColorStyles[iconColor],
          "border"
        )}>
          {icon}
        </div>
      )}
      
      {iconPosition === "left" && (
        <>
          <div className={cn(
            "shrink-0",
            iconContainerStyles[iconVariant],
            iconBackgroundStyles[iconVariant],
            iconColorStyles[iconColor],
            "border"
          )}>
            {icon}
          </div>
          <div className="flex-1">
            {props.children}
          </div>
        </>
      )}

      {iconPosition === "right" && (
        <>
          <div className="flex-1">
            {props.children}
          </div>
          <div className={cn(
            "shrink-0",
            iconContainerStyles[iconVariant],
            iconBackgroundStyles[iconVariant],
            iconColorStyles[iconColor],
            "border"
          )}>
            {icon}
          </div>
        </>
      )}

      {(iconPosition === "top" || iconPosition === "floating") && props.children}
    </Card>
  )
}

// Stat Card for metrics
function StatCard({
  className,
  title,
  value,
  change,
  trend = "neutral",
  icon,
  iconColor = "primary",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  iconColor?: "primary" | "success" | "warning" | "destructive" | "accent" | "secondary"
  variant?: "default" | "gradient" | "filled"
}) {
  const trendColors = {
    up: "text-success bg-success/10 border-success/20",
    down: "text-destructive bg-destructive/10 border-destructive/20",
    neutral: "text-muted-foreground bg-muted border-border",
  }

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  }

  const variantStyles = {
    default: "",
    gradient: "bg-gradient-to-br from-primary/5 to-transparent",
    filled: "bg-gradient-to-br from-primary/10 to-primary/5",
  }

  return (
    <CardWithIcon
      icon={icon}
      iconPosition="top"
      iconVariant="circle"
      iconColor={iconColor}
      variant={variant}
      className={cn(
        "text-center",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <CardHeader className="!px-0 !pb-0">
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {title}
        </CardDescription>
        <CardTitle size="xl" className="mt-2 font-bold">
          {value}
        </CardTitle>
      </CardHeader>
      {change && (
        <CardContent className="!px-0 !pt-2">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            trendColors[trend]
          )}>
            <span>{trendIcons[trend]}</span>
            {change}
          </span>
        </CardContent>
      )}
    </CardWithIcon>
  )
}

// Feature Card for highlighting features
function FeatureCard({
  className,
  title,
  description,
  icon,
  features = [],
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  description: string
  icon: React.ReactNode
  features?: string[]
  variant?: "default" | "gradient" | "accent"
}) {
  return (
    <CardWithIcon
      icon={icon}
      iconPosition="top"
      iconVariant="circle"
      variant={variant}
      className={cn("h-full", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle gradient size="lg">
          {title}
        </CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      {features.length > 0 && (
        <CardContent className="!pt-0">
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </CardWithIcon>
  )
}

// Testimonial Card
function TestimonialCard({
  className,
  quote,
  author,
  role,
  avatar,
  rating = 5,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  quote: string
  author: string
  role: string
  avatar?: React.ReactNode
  rating?: 1 | 2 | 3 | 4 | 5
  variant?: "default" | "gradient"
}) {
  return (
    <Card
      variant={variant}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute top-0 right-0 text-primary/5 text-6xl font-serif">"</div>
      <CardContent>
        <p className="text-lg italic mb-6 relative z-10">"{quote}"</p>
        <div className="flex items-center gap-3">
          {avatar && (
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
              {avatar}
            </div>
          )}
          <div>
            <div className="font-semibold">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
          <div className="ml-auto flex gap-0.5">
            {[...Array(rating)].map((_, i) => (
              <div key={i} className="text-warning">★</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Pricing Card
function PricingCard({
  className,
  title,
  price,
  period = "/month",
  description,
  features,
  ctaText = "Get Started",
  popular = false,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  ctaText?: string
  popular?: boolean
  variant?: "default" | "gradient" | "primary"
}) {
  return (
    <CardDecorated
      decoration={popular ? "top-accent" : "none"}
      decorationColor={popular ? "primary" : "default"}
      decorationSize={popular ? "lg" : "default"}
      variant={variant}
      className={cn("h-full relative", popular && "border-primary/50 shadow-lg", className)}
      {...props}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle size="lg">{title}</CardTitle>
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">{period}</span>
          </div>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <button className={cn(
          "w-full py-3 rounded-lg font-semibold transition-all",
          popular 
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg" 
            : "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
        )}>
          {ctaText}
        </button>
      </CardFooter>
    </CardDecorated>
  )
}

// Export all components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardDecorated,
  CardWithIcon,
  StatCard,
  FeatureCard,
  TestimonialCard,
  PricingCard,
}