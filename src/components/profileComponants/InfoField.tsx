import React from "react";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { InputFieldConfig } from "../../../types/profileTypes";
// import { InputFieldConfig } from "./types";

interface InfoFieldProps extends InputFieldConfig {
  isEditing: boolean;
  control: any;
  defaultValue: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const InfoField: React.FC<InfoFieldProps> = React.memo(
  ({
    label,
    icon: Icon,
    field,
    type = "text",
    isTextarea = false,
    isEditing,
    control,
    defaultValue,
  }) => (
    <motion.div
      className="space-y-2"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon size={16} />
        {label}
      </Label>
      {isEditing ? (
        <Controller
          name={field}
          control={control}
          defaultValue={defaultValue}
          render={({ field: controllerField }) =>
            isTextarea ? (
              <Textarea {...controllerField} className="min-h-[100px]" />
            ) : (
              <Input {...controllerField} type={type} />
            )
          }
        />
      ) : (
        <div className="p-3 rounded-md border">
          {defaultValue || "Not provided"}
        </div>
      )}
    </motion.div>
  )
);

export default InfoField;
