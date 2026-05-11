import { InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ConditionalExpressionModal() {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link">
                        <InfoIcon className="text-primary w-4 h-4" />    
                    </Button>    
                </DialogTrigger>

                <DialogContent className="flex flex-col max-h-[90%] gap-y-4 p-0 m-0 sm:max-w-xl">
                    <DialogHeader className="border-b border-b-border px-4 py-4">
                        <DialogTitle>Conditional expression</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2">
                        <div 
                            className="
                                [&>code]:block 
                                [&>code]:mb-1
                                [&>code]:p-2
                                [&>code]:rounded-md
                                [&>code]:text-xs
                                [&>code]:bg-destructive/10 
                                [&_i]:text-primary
                                [&_b]:text-destructive
                                [&_code_div]:mb-2 
                                [&_code_div]:opacity-70
                                [&_code_div_b]:text-primary
                                [&_h6]:mt-2
                                [&_h6]:text-sm
                            "
                        >
                            <code>
                                <p><b>$Sex</b> = "M"</p>
                                <p><b>$Gestation</b> = 39</p>
                                <p><b>$Diagnoses</b> = ["Sepsis", "Jaundice", "Premature"]</p>
                            </code>

                            <br />

                            <code>
                                <p><b>$Sex</b> = "F" or <b>$Gestation</b> &gt; 39 <i>{'-false'}</i></p>
                            </code>
                            <code>
                                <p><b>$Sex</b> = "F" or <b>$Gestation</b> &gt;= 39 <i>{'-true'}</i></p>
                            </code>
                            <code>
                                <p><b>$Sex</b> = "F" or <b>$Gestation</b> &gt;= 39 <i>{'-true'}</i></p>
                            </code>

                            <h6>Multi selection</h6>
                            
                            <code>
                                <p><b>$Diagnoses</b> = "LBW" <i>{'-false'}</i></p>
                                <div>For multiple values, we check if "LBW" (right side of the expression) is <b>included</b> in the selection</div>

                                <p><b>$Diagnoses</b> != "LBW" <i>{'-true'}</i></p>
                                <div>For multiple values, we check if "LBW" (right side of the expression) is <b>NOT included</b> in the selection</div>

                                <br />

                                <p>[<b>$Diagnoses</b> includes ("LBW")] <i>{'-false'}</i></p>
                                <p>[<b>$Diagnoses</b> includes ("LBW","Sepsis")] <i>{'-true'}</i></p>

                                <br />

                                <p>[<b>$Diagnoses</b> excludes ("LBW")] <i>{'-true'}</i></p>
                                <p>[<b>$Diagnoses</b> excludes ("LBW","Sepsis")] <i>{'-false'}</i></p>
                            </code>

                            <h6>Stacked expressions</h6>
                            <code>
                                <div>For stacked expressions, every line has to be true.</div>

                                <br />

                                <p>
                                    <b>$Sex</b> = "F" or <b>$Gestation</b> &gt; 39
                                    <br />
                                    [<b>$Diagnoses</b> includes ("LBW")]
                                </p>
                                <p><i>{'-false'}</i></p>

                                <br /><br />

                                <p>
                                    <b>$Sex</b> = "M" or <b>$Gestation</b> &gt; 39
                                    <br />
                                    [<b>$Diagnoses</b> includes ("LBW")]
                                </p>
                                <p><i>{'-false'}</i></p>

                                <br /><br />

                                <p>
                                    <b>$Sex</b> = "M" or <b>$Gestation</b> &gt; 39
                                    <br />
                                    [<b>$Diagnoses</b> includes ("LBW","Sepsis")]
                                </p>
                                <p><i>{'-true'}</i></p>

                                <br /><br />

                                <p>
                                    <b>$Sex</b> = "M" or <b>$Gestation</b> &gt;= 39
                                    <br />
                                    [<b>$Diagnoses</b> excludes ("LBW")]
                                </p>
                                <p><i>{'-true'}</i></p>
                            </code>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-t-border px-4 py-2 items-center w-full">
                        <DialogClose asChild>
                            <Button variant="ghost">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>  
        </>
    );
}
