/*
 * frontend/pager.ts
 * LeadershipTrakcer - Martial arts attendance logger
 *
 * Copyright (c) 2019, John Nunley and Larson Rivera
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// page switcher widget
import * as $ from "jquery";

import { getParameter } from "./parameter";

export type PageSwitcher = (page: number) => void;

export class Pager {
  private frame: JQuery;

  constructor(
    private totalPages: number,
    private pageSwitcher: PageSwitcher
  ) {
    this.frame = $("<form>");
    this.renderWidget();
  }

  renderWidget() {
    $("<tr>")
      .appendTo($("<table>").appendTo(this.frame))
      .append(((): JQuery => {
        const col = $();
        for (let i = 0; i < this.totalPages; i++) {
          col.add($(`<button value="${i+1}"></button>`).click((this: HTMLElement) => {
            this.pageSwitcher(parseInt($(this).attr("value"), 10) - 1);
          }));
        }
        return col;
      })());
  }
}

export function setupPager() {
  const diagramPager = $("#diagram-pager");
  if (diagramPager.length) {
    const pager = new Pager(
      parseInt(diagramPager.attr("class"), 10),
      (page: number) => { window.location.href = `/?eventpage=${page}`; }
    );
  }
}
