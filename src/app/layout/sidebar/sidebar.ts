import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private sidebarService = inject(SidebarService);
  private sanitizer = inject(DomSanitizer);
  isCollapsed$ = this.sidebarService.isCollapsed$;

  navItems = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
      exact: true,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>')
    },
    {
      label: 'Tasks',
      route: '/tasks',
      icon: 'tasks',
      exact: true,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>')
    },
    {
      label: 'Users',
      route: '/users',
      icon: 'users',
      exact: true,
      svgIcon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>')
    }
  ];

  ngOnInit(): void {
    // Auto-close sidebar on mobile when navigating
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  closeSidebarOnMobile(): void {
    // Close sidebar on mobile after clicking a link
    if (window.innerWidth < 992) {
      this.sidebarService.toggleSidebar();
    }
  }
}
