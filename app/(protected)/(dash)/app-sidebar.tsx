// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import useProjects from "@/hooks/use-project";
// import { cn } from "@/lib/utils";
// import { Bot, LayoutDashboard, Plus } from "lucide-react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";

// // const items = [
// //   {
// //     title: "Dashboard",
// //     url: "/dashboard",
// //     icon: LayoutDashboard,
// //   },
// //   {
// //     title: "Q&A",
// //     url: `/qa`,
// //     icon: Bot,
// //   },
// // ];

// const AppSidebar = () => {
//   const pathname = usePathname();
//   const { open } = useSidebar();
//   const router = useRouter();

//   const { allProjects, projectId, setSelectedProjectId } = useProjects();

//   const handleProject = (projectId: string) => {
//     setSelectedProjectId(projectId);
//     router.push(`/dashboard/${projectId}`);
//   };

//   return (
//     <Sidebar collapsible="icon" variant="floating" >
//       <SidebarHeader>
//         <div className="flex items-center gap-2">
//           {/* <Image src= {} alt="logo" width={40} height={40} /> 
//           { open && <h1 className="text-lg font-bold text-primary/80">Dionysus</h1> }
//           </Image> */}
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         {/* sidebar first group */}
//         <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>

//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <Link
//                     href="/dashboard"
//                     className={cn(
//                       {
//                         "!bg-primary !text-white": pathname === "/dashboard",
//                       },
//                       "list-none"
//                     )}
//                   >
//                     <LayoutDashboard />
//                     <span>Dashboard</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   {projectId ? (
//                     <Link
//                       href={`/dashboard/${projectId}/qa`}
//                       className={cn(
//                         {
//                           "!bg-primary !text-white":
//                             pathname === `/dashboard/${projectId}/qa`,
//                         },
//                         "list-none"
//                       )}
//                     >
//                       <Bot />
//                       <span>Q&A</span>
//                     </Link>
//                   ) : (
//                     <span className="opacity-50 flex items-center gap-2">
//                       <Bot />
//                       <span>Q&A</span>
//                     </span>
//                   )}
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         <SidebarGroup>
//           <SidebarGroupLabel>your projects</SidebarGroupLabel>

//           <SidebarGroupContent>
//             <SidebarMenu>
//               {allProjects?.map((project) => {
//                 return (
//                   <SidebarMenuItem key={project.projectName}>
//                     <SidebarMenuButton asChild>
//                       <div
//                         onClick={() => handleProject(project.id)}
//                         className="cursor-pointer"
//                       >
//                         <div
//                           className={cn(
//                             "item-center flex size-6 justify-center rounded-sm border bg-white text-sm text-primary",
//                             {
//                               "bg-primary text-white": project.id === projectId,
//                             }
//                           )}
//                         >
//                           {project.projectName[0]}
//                         </div>
//                         <span>{project.projectName}</span>
//                       </div>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}

//               <div className="h-2"></div>

//               {open && (
//                 <SidebarMenuItem>
//                   <Link href="/create">
//                     <Button size="sm" variant={"outline"} className="w-fit">
//                       <Plus />
//                       Create new project
//                     </Button>
//                   </Link>
//                 </SidebarMenuItem>
//               )}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// };

// export default AppSidebar;
