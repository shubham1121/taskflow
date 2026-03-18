import { Component, inject, HostListener } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-app-shell',
  imports: [CommonModule, Sidebar, Header, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private sidebarService = inject(SidebarService);
  isCollapsed$ = this.sidebarService.isCollapsed$;

  // Close sidebar on small screens when clicking backdrop
  onBackdropClick(): void {
    const isMobile = window.innerWidth < 992;
    if (isMobile && !this.sidebarService.getSidebarState()) {
      this.sidebarService.toggleSidebar();
    }
  }

  // Close sidebar on window resize if screen gets larger
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      // On large screens, ensure sidebar is visible
      const currentState = this.sidebarService.getSidebarState();
      if (currentState) {
        this.sidebarService.toggleSidebar();
      }
    }
  }
}
