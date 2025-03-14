#ifndef UI_IMGUI_H
#define UI_IMGUI_H
/// "ui-imgui.h"
///----------------------------------------------------------------------------|
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
    struct ImGuiDemoWindowData
    {   bool MainMenuBar = false;
        bool Help        = false;
        bool About       = false;
        bool Demo        = false;
        bool Log         = false;
    };

    struct  TextField
    {   std::string_view name;
        std::string*        s;

        void bind(std::string_view nm, std::string* str)
        {   name = nm ;
            s    = str;
        }

        void prn() const
        {   ImGui::Text("%s: %s", name.data(), s->c_str());
        }
    };

    struct Clear {};

    ///------------------------------------------------------------------------|
    /// UI
    ///--------------------------------------------------------------------- UI:
    struct  UITest
    {       UITest() = delete;
            UITest(sf::RenderWindow& w) : window(w)
            {   initImgui();
                log.reserve(0xFFFFF);
            }

        void add(const TextField& tf)
        {   textFields.push_back (tf);
        }

        void show()
        {
            auto& color = ImGui::GetStyle().Colors[ImGuiCol_WindowBg];

            color = ImColor(0.f, 0.1f, 0.f, 255.0f);
            if (isShow.About) showAbout();

            color = ImColor(0.f, 0.f, 0.4f, 0.8f);
            if (isShow.Log  ) showLog           (log);
            if (isShow.Demo ) ImGui::ShowDemoWindow();

            color = ImColor(35,35,35,190);
            showMain();
        }

        UITest& operator<<(const int n)
        {   log += std::to_string   (n);
            return *this;
        }

        UITest& operator<<(std::string_view s)
        {   log += s;
            return *this;
        }

        UITest& operator<<(const Clear)
        {   log.clear();
            return *this;
        }

        bool isAnyFocused{false};

    private:
        sf::RenderWindow&    window       ;
        std::list<TextField> textFields   ;

        std::string  str {"...пусто..."};
        std::string  log ;
        std::string  help{"KEYBOARD:\n"
                          "  W.S,1,2,3,0,C,F,N\n "};

        float        f{};

        ImGuiDemoWindowData isShow;

        ///--------------------------------------|
        /// initImgui                            |
        ///--------------------------------------:
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
        }

        ///--------------------------------------|
        /// Hello, Informer!                     |
        ///--------------------------------------:
        void showMain()
        {

        /// ImGui::SetNextWindowSize({500,500});
            ImGui::Begin ("Hello, Informer!",
                            nullptr,
                            ImGuiWindowFlags_NoCollapse
                          | ImGuiWindowFlags_HorizontalScrollbar
                          | ImGuiWindowFlags_AlwaysVerticalScrollbar
                          | ImGuiWindowFlags_MenuBar
                      /// | ImGuiWindowFlags_NoBackground
                      /// | ImGuiWindowFlags_NoResize
                      /// | ImGuiWindowFlags_AlwaysAutoResize
                         );

            isAnyFocused = ImGui::IsAnyItemActive();
            ///          = ImGui::IsWindowFocused();

            InformerMenuBar(isShow);

            ///-------------------------------|
            /// Батоны.                       |
            ///-------------------------------:
            if(ImGui::Button("Demo", {100,40}))
            {   isShow.Demo = !isShow.Demo;
            }

            ImGui::SameLine ();

            if(ImGui::Button("Log", {100,40}))
            {   isShow.Log = !isShow.Log;
            }

            ImGui::SameLine ();

            if(ImGui::Button("Exit", {100,40}))
            {   window.close();
            }

            ///-------------------------------|
            /// Инфо о внешних полях.         |
            ///-------------------------------:
            for(const auto& t : textFields) t.prn();

            ImGui::Text ("isAnyFocused : %d", isAnyFocused);////////////////////

            if (isShow.Help && ImGui::CollapsingHeader("Help..."))
            {   ImGui::Text("%s", help.c_str());
            }

            ImGui::InputText("InputText", &str, sizeof str);

            ImGui::DragFloat("float##3a", &f);

            if (ImGui::CollapsingHeader("Log..."))
            {   ImGui::Text("%s", log .c_str());
            }

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

        ///--------------------------------------|
        /// initImgui                            |
        ///--------------------------------------:
        static void InformerMenuBar(ImGuiDemoWindowData& isShow)
        {   if (ImGui::BeginMenuBar())
            {   if (ImGui::BeginMenu("Menu"))
                {   ImGui::MenuItem("Item1", NULL, &isShow.MainMenuBar);
                    ImGui::MenuItem("Item2", NULL, &isShow.MainMenuBar);
                    ImGui::SeparatorText("-----");
                    ImGui::MenuItem("Item3", NULL, &isShow.MainMenuBar);
                    ImGui::MenuItem("Item4", NULL, &isShow.MainMenuBar);
                    ImGui::EndMenu();
                }

                if (ImGui::BeginMenu("Tools"))
                {   ImGui::MenuItem("Item5", NULL, &isShow.MainMenuBar);
                    ImGui::MenuItem("Item6", NULL, &isShow.MainMenuBar);
                    ImGui::EndMenu();
                }

                if (ImGui::BeginMenu("?"))
                {   ImGui::MenuItem("Help" , NULL, &isShow.Help );
                    ImGui::MenuItem("About", NULL, &isShow.About);
                    ImGui::EndMenu();
                }

                ImGui::EndMenuBar();
            }
        }

        ///--------------------------------------|
        /// showAbout.                           |
        ///--------------------------------------:
        void showAbout()
        {
            const char* const about
            {   "\n"
                "\tТема : Puzzle-384\n"
                "\tФорум: www.cyberforum.ru\n"
                "\tАвтор: xlat-code\n"
            };

            ImGui::Begin("About", &isShow.About, ImGuiWindowFlags_NoCollapse);
            ImGui::Text ("%s", about);
            ImGui::End  ();
        }

        ///--------------------------------------|
        /// showLog.                             |
        ///--------------------------------------:
        void showLog(std::string_view str)
        {
            ImGui::Begin("Log", &isShow.Log,
                    ImGuiWindowFlags_NoCollapse
            /// |   ImGuiWindowFlags_NoBackground
                |   ImGuiWindowFlags_NoResize
            );
            ImGui::Text("%s", str.data());
            ImGui::End ();
        }
    };
};

#endif // UI_IMGUI_H
