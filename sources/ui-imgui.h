#ifndef UI_IMGUI_H
#define UI_IMGUI_H
/// "ui-imgui.h"
///-----------------------------------------------------------------------------
/// ...
///----------------------------------------------------------------------------:

#include "imgui.h"
#include "imgui-SFML.h"
#include "misc/cpp/imgui_stdlib.h"

#include "myl.h"

///---------|
/// ImGui   |
///---------:
namespace uii
{
    struct  TextField
    {
        std::string_view name;
        std::string*        s;

        void bind(std::string_view nm, std::string* str)
        {   name = nm ;
            s    = str;
        }

        void prn() const
        {   ImGui::Text("%s: %s", name.data(), s->c_str());
        }
    };

    ///-------------------------------------------------------------------------
    /// UI
    ///--------------------------------------------------------------------- UI:
    struct  UITest
    {       UITest() = delete;
            UITest(sf::RenderWindow& w) : window(w)
            {   initImgui();
                log.reserve(0xFFFFF);
            }

        void add(const TextField& tf)
        {   textFields.push_back(tf);
        }

        void go()
        {   if(isDemo) ImGui::ShowDemoWindow();

            drawImgui();
        }

        UITest& operator<<(std::string_view s)
        {   log += s;
            return *this;
        }

    private:
        sf::RenderWindow& window;
        bool              isDemo{false};
        std::list<TextField> textFields;

        std::string  str {"...пусто..."};
        std::string  log ;
        std::string  help{"KEYBOARD:\n"
                          "  W.S,1,0,C,F,N,Enter\n "};

        float        f{};

        void initImgui()
        {   bool
            isGood = ImGui::SFML::Init(window);
            if (!isGood)
            {   ASSERTM(false, "ImGui::SFML::Init() is failed ...")
            }

            ImGuiIO& io = ImGui::GetIO();

            io.Fonts->Clear();
            isGood = io.Fonts->AddFontFromFileTTF("consola.ttf", 18.f, NULL,
                     io.Fonts->GetGlyphRangesCyrillic());
            if (!isGood)
            {   ASSERTM(false, "io.Fonts->AddFontFromFileTTF() is failed ...")
            }

            isGood = ImGui::SFML::UpdateFontTexture();
            if (!isGood)
            {   ASSERTM(false, "ImGui::SFML::UpdateFontTexture()is failed ...")
            }

            ImGui::GetStyle().Colors[ImGuiCol_WindowBg] = ImColor(35,35,35,190);
        }

        void drawImgui()
        {   /// ImGui::SetNextWindowSize({500,500});
            ImGui::Begin ("Hello, Informer!",
                            nullptr,
                            ImGuiWindowFlags_NoCollapse
                            |  ImGuiWindowFlags_HorizontalScrollbar
                            |  ImGuiWindowFlags_AlwaysVerticalScrollbar
                        /// |  ImGuiWindowFlags_NoBackground
                        /// |  ImGuiWindowFlags_NoResize
                        /// |  ImGuiWindowFlags_AlwaysAutoResize
                         );

            if(ImGui::Button("Demo", {100,40}))
            {   isDemo = !isDemo;
            }

            ImGui::SameLine ();

            if(ImGui::Button("Exit", {100,40}))
            {   window.close();
            }

            for(const auto& t : textFields) t.prn();

            ImGui::InputText( "InputText", &str, sizeof str);

            ImGui::DragFloat("float##3a", &f);

            ImGui::Text("%s", help.c_str());
            ImGui::Text("%s", log .c_str());

            //ImGui::PushItemWidth(10);
            //ImGui::Text("%s", igHelp.c_str());
            //ImGui::PopItemWidth();

            ImGui::End();

            /*
            ImGui::SetNextWindowSize({50,50});
            ImGui::BeginTooltip            ();
            ImGui::Text("%s", igHelp.c_str());
            ImGui::EndTooltip              ();
            */
        }
    };
};

#endif // UI_IMGUI_H
